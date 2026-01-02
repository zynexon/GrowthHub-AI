from functools import wraps
from flask import request, jsonify
from app.modules.api_keys.services import APIKeyService

def require_api_key(allowed_scopes=None):
    """
    Decorator to validate API key authentication
    Usage: @require_api_key(['read:leads', 'write:leads'])
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get API key from Authorization header
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                return jsonify({'error': 'Missing Authorization header'}), 401
            
            # Expected format: "Bearer gh_live_XXXXXXXX"
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                return jsonify({'error': 'Invalid Authorization header format. Use: Bearer <api_key>'}), 401
            
            api_key = parts[1]
            
            # Validate the API key
            key_data = APIKeyService.validate_api_key(api_key)
            
            if not key_data:
                return jsonify({'error': 'Invalid or expired API key'}), 401
            
            # Check scopes if specified
            if allowed_scopes:
                key_scopes = key_data['scopes']
                
                # Check for wildcard
                if '*' in key_scopes or 'read:*' in key_scopes or 'write:*' in key_scopes:
                    pass  # Full access
                else:
                    # Check if key has required scopes
                    has_permission = any(scope in key_scopes for scope in allowed_scopes)
                    if not has_permission:
                        return jsonify({
                            'error': 'Insufficient permissions',
                            'required_scopes': allowed_scopes,
                            'key_scopes': key_scopes
                        }), 403
            
            # Attach organization_id to request for use in route
            request.organization_id = key_data['organization_id']
            request.api_key_scopes = key_data['scopes']
            request.api_key_id = key_data['key_id']
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator
