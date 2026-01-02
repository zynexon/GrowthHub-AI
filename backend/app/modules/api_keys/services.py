import secrets
import bcrypt
from datetime import datetime, timedelta
from app.extensions import get_supabase_admin

class APIKeyService:
    @staticmethod
    def generate_api_key():
        """Generate a secure random API key with prefix"""
        # Format: gh_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (total 48 chars)
        random_part = secrets.token_urlsafe(32)[:32]  # 32 chars
        api_key = f"gh_live_{random_part}"
        return api_key
    
    @staticmethod
    def hash_api_key(api_key):
        """Hash API key using bcrypt"""
        return bcrypt.hashpw(api_key.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    @staticmethod
    def verify_api_key(api_key, key_hash):
        """Verify API key against stored hash"""
        return bcrypt.checkpw(api_key.encode('utf-8'), key_hash.encode('utf-8'))
    
    @staticmethod
    def create_api_key(organization_id, name, scopes=None, expires_in_days=None):
        """Create a new API key"""
        supabase = get_supabase_admin()
        
        # Generate API key
        api_key = APIKeyService.generate_api_key()
        key_prefix = api_key[:8]  # "gh_live_"
        key_hash = APIKeyService.hash_api_key(api_key)
        
        # Calculate expiration
        expires_at = None
        if expires_in_days:
            expires_at = (datetime.utcnow() + timedelta(days=expires_in_days)).isoformat()
        
        # Set default scopes if not provided
        if scopes is None:
            scopes = ['read:*']
        
        # Insert into database
        key_data = {
            'organization_id': organization_id,
            'key_prefix': key_prefix,
            'key_hash': key_hash,
            'name': name,
            'scopes': scopes,
            'expires_at': expires_at,
            'is_active': True
        }
        
        response = supabase.table('api_keys').insert(key_data).execute()
        
        # Return the key info with the PLAIN API KEY (only time it's visible)
        key_info = response.data[0]
        key_info['api_key'] = api_key  # Only returned once!
        
        return key_info
    
    @staticmethod
    def get_all_keys(organization_id):
        """Get all API keys for organization (without full keys)"""
        supabase = get_supabase_admin()
        
        response = supabase.table('api_keys') \
            .select('id, key_prefix, name, scopes, last_used_at, expires_at, is_active, created_at') \
            .eq('organization_id', organization_id) \
            .order('created_at', desc=True) \
            .execute()
        
        return response.data
    
    @staticmethod
    def validate_api_key(api_key):
        """Validate an API key and return organization_id and scopes"""
        supabase = get_supabase_admin()
        
        # Extract prefix for lookup
        key_prefix = api_key[:8]
        
        # Find all keys with this prefix
        response = supabase.table('api_keys') \
            .select('*') \
            .eq('key_prefix', key_prefix) \
            .eq('is_active', True) \
            .execute()
        
        if not response.data:
            return None
        
        # Try to verify against each key with this prefix
        for key_record in response.data:
            if APIKeyService.verify_api_key(api_key, key_record['key_hash']):
                # Check expiration
                if key_record['expires_at']:
                    expires_at = datetime.fromisoformat(key_record['expires_at'].replace('Z', '+00:00'))
                    if datetime.utcnow() > expires_at:
                        return None  # Expired
                
                # Update last_used_at
                supabase.table('api_keys') \
                    .update({'last_used_at': datetime.utcnow().isoformat()}) \
                    .eq('id', key_record['id']) \
                    .execute()
                
                return {
                    'organization_id': key_record['organization_id'],
                    'scopes': key_record['scopes'],
                    'key_id': key_record['id']
                }
        
        return None
    
    @staticmethod
    def revoke_key(organization_id, key_id):
        """Revoke (deactivate) an API key"""
        supabase = get_supabase_admin()
        
        response = supabase.table('api_keys') \
            .update({'is_active': False}) \
            .eq('id', key_id) \
            .eq('organization_id', organization_id) \
            .execute()
        
        return response.data[0] if response.data else None
    
    @staticmethod
    def delete_key(organization_id, key_id):
        """Permanently delete an API key"""
        supabase = get_supabase_admin()
        
        response = supabase.table('api_keys') \
            .delete() \
            .eq('id', key_id) \
            .eq('organization_id', organization_id) \
            .execute()
        
        return True
    
    @staticmethod
    def get_statistics(organization_id):
        """Get API key usage statistics"""
        supabase = get_supabase_admin()
        
        # Get all keys
        all_keys = supabase.table('api_keys') \
            .select('*') \
            .eq('organization_id', organization_id) \
            .execute()
        
        total_keys = len(all_keys.data)
        active_keys = len([k for k in all_keys.data if k['is_active']])
        inactive_keys = total_keys - active_keys
        
        # Count recently used (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recently_used = len([
            k for k in all_keys.data 
            if k['last_used_at'] and datetime.fromisoformat(k['last_used_at'].replace('Z', '+00:00')) > seven_days_ago
        ])
        
        return {
            'total_keys': total_keys,
            'active_keys': active_keys,
            'inactive_keys': inactive_keys,
            'recently_used': recently_used
        }
