from app.extensions import get_supabase_admin
from flask import jsonify
from datetime import datetime

class SettingsService:
    """Service for managing organization settings, user profile, and notification preferences"""
    
    @staticmethod
    def get_organization_settings(organization_id):
        """Get or create organization settings"""
        supabase = get_supabase_admin()
        
        # Try to get existing settings
        response = supabase.table('organization_settings').select('*').eq('organization_id', organization_id).execute()
        
        if response.data:
            return response.data[0]
        
        # If no settings exist, create default ones
        default_settings = {
            'organization_id': organization_id,
            'industry': None,
            'company_size': None,
            'timezone': 'UTC',
            'default_currency': 'USD'
        }
        
        create_response = supabase.table('organization_settings').insert(default_settings).execute()
        return create_response.data[0] if create_response.data else None
    
    @staticmethod
    def update_organization_settings(organization_id, updates):
        """Update organization settings"""
        supabase = get_supabase_admin()
        
        # Check if settings exist
        existing = supabase.table('organization_settings').select('id').eq('organization_id', organization_id).execute()
        
        if existing.data:
            # Update existing
            response = supabase.table('organization_settings').update(updates).eq('organization_id', organization_id).execute()
        else:
            # Create new
            updates['organization_id'] = organization_id
            response = supabase.table('organization_settings').insert(updates).execute()
        
        return response.data[0] if response.data else None
    
    @staticmethod
    def get_user_profile(user_id):
        """Get user profile from Supabase auth"""
        supabase = get_supabase_admin()
        
        # Get user from auth.users
        try:
            response = supabase.auth.admin.get_user_by_id(user_id)
            if response:
                user = response.user
                return {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.user_metadata.get('full_name', ''),
                    'created_at': user.created_at
                }
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None
    
    @staticmethod
    def update_user_profile(user_id, updates):
        """Update user profile (name, email)"""
        supabase = get_supabase_admin()
        
        try:
            # Prepare update payload
            update_payload = {}
            
            # Update email if provided
            if 'email' in updates:
                update_payload['email'] = updates['email']
            
            # Update user metadata (full_name)
            if 'full_name' in updates:
                update_payload['user_metadata'] = {
                    'full_name': updates['full_name']
                }
            
            # Use admin API to update user
            if update_payload:
                response = supabase.auth.admin.update_user_by_id(user_id, update_payload)
                if response:
                    user = response.user
                    return {
                        'id': user.id,
                        'email': user.email,
                        'full_name': user.user_metadata.get('full_name', ''),
                        'created_at': user.created_at
                    }
        except Exception as e:
            print(f"Error updating user profile: {e}")
            return None
    
    @staticmethod
    def change_password(user_id, new_password):
        """Change user password"""
        supabase = get_supabase_admin()
        
        try:
            response = supabase.auth.admin.update_user_by_id(user_id, {'password': new_password})
            return True if response else False
        except Exception as e:
            print(f"Error changing password: {e}")
            return False
    
    @staticmethod
    def get_notification_preferences(user_id, organization_id):
        """Get or create notification preferences"""
        supabase = get_supabase_admin()
        
        # Try to get existing preferences
        response = supabase.table('notification_preferences').select('*').eq('user_id', user_id).eq('organization_id', organization_id).execute()
        
        if response.data:
            return response.data[0]
        
        # If no preferences exist, create default ones
        default_prefs = {
            'user_id': user_id,
            'organization_id': organization_id,
            'customer_health_alerts': True,
            'churn_risk_alerts': True,
            'job_status_updates': True
        }
        
        create_response = supabase.table('notification_preferences').insert(default_prefs).execute()
        return create_response.data[0] if create_response.data else None
    
    @staticmethod
    def update_notification_preferences(user_id, organization_id, updates):
        """Update notification preferences"""
        supabase = get_supabase_admin()
        
        # Check if preferences exist
        existing = supabase.table('notification_preferences').select('id').eq('user_id', user_id).eq('organization_id', organization_id).execute()
        
        if existing.data:
            # Update existing
            response = supabase.table('notification_preferences').update(updates).eq('user_id', user_id).eq('organization_id', organization_id).execute()
        else:
            # Create new
            updates['user_id'] = user_id
            updates['organization_id'] = organization_id
            response = supabase.table('notification_preferences').insert(updates).execute()
        
        return response.data[0] if response.data else None
    
    @staticmethod
    def get_billing_info(organization_id):
        """Get billing and plan information (placeholder for now)"""
        supabase = get_supabase_admin()
        
        # Get organization
        response = supabase.table('organizations').select('plan_type').eq('id', organization_id).execute()
        
        if response.data:
            plan_type = response.data[0].get('plan_type', 'free')
            
            # Static usage summary for now
            return {
                'current_plan': plan_type.title(),
                'plan_type': plan_type,
                'usage': {
                    'leads': '0 / Unlimited',
                    'customers': '0 / Unlimited',
                    'jobs': '0 / Unlimited',
                    'api_calls': '0 / 10,000 per month'
                },
                'can_upgrade': True
            }
        
        return None
