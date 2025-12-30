"""Authentication decorators for route protection."""
from functools import wraps
from flask import request, jsonify
from app.extensions import get_supabase
from .exceptions import AuthException


def require_auth(f):
    """Require valid authentication token."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Get token from header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Missing or invalid authorization header'}), 401
            
            token = auth_header.split(' ')[1]
            
            # Verify token with Supabase
            supabase = get_supabase()
            user = supabase.auth.get_user(token)
            
            if not user:
                return jsonify({'error': 'Invalid token'}), 401
            
            # Attach user to request
            request.user = user.user
            
            return f(*args, **kwargs)
            
        except Exception as e:
            return jsonify({'error': 'Authentication failed', 'details': str(e)}), 401
    
    return decorated_function


def require_role(*allowed_roles):
    """Require specific role(s) in the organization context."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                # Get organization from header
                org_id = request.headers.get('X-Organization-Id')
                print(f"[require_role] X-Organization-Id header: {org_id}")
                if not org_id:
                    print("[require_role] No organization ID in header")
                    return jsonify({'error': 'Organization context required'}), 400
                
                # Get user from request (set by require_auth)
                if not hasattr(request, 'user'):
                    print("[require_role] No user in request")
                    return jsonify({'error': 'Authentication required'}), 401
                
                user_id = request.user.id
                print(f"[require_role] User ID: {user_id}, Org ID: {org_id}")
                
                # Get user's role in this organization
                from app.extensions import get_supabase_admin
                admin = get_supabase_admin()
                response = admin.table('user_organizations')\
                    .select('role')\
                    .eq('user_id', user_id)\
                    .eq('organization_id', org_id)\
                    .single()\
                    .execute()
                
                print(f"[require_role] Query response: {response.data}")
                
                if not response.data:
                    print("[require_role] User not in organization")
                    return jsonify({'error': 'User not in organization'}), 403
                
                user_role = response.data['role']
                print(f"[require_role] User role: {user_role}, Allowed roles: {allowed_roles}")
                
                # Check if user has required role
                if user_role not in allowed_roles:
                    print(f"[require_role] Insufficient permissions: {user_role} not in {allowed_roles}")
                    return jsonify({'error': 'Insufficient permissions'}), 403
                
                # Attach org_id and role to request
                request.organization_id = org_id
                request.user_role = user_role
                print(f"[require_role] Authorization successful")
                
                return f(*args, **kwargs)
                
            except Exception as e:
                print(f"[require_role] Exception: {str(e)}")
                import traceback
                traceback.print_exc()
                return jsonify({'error': 'Authorization failed', 'details': str(e)}), 403
        
        return decorated_function
    return decorator


def require_org_access(f):
    """Require user to have access to organization (any role)."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            org_id = request.headers.get('X-Organization-Id')
            if not org_id:
                return jsonify({'error': 'Organization context required'}), 400
            
            if not hasattr(request, 'user'):
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = request.user.id
            
            # Verify user belongs to organization
            from app.extensions import get_supabase_admin
            admin = get_supabase_admin()
            response = admin.table('user_organizations')\
                .select('role')\
                .eq('user_id', user_id)\
                .eq('organization_id', org_id)\
                .single()\
                .execute()
            
            if not response.data:
                return jsonify({'error': 'Access denied'}), 403
            
            request.organization_id = org_id
            request.user_role = response.data['role']
            
            return f(*args, **kwargs)
            
        except Exception as e:
            return jsonify({'error': 'Access check failed', 'details': str(e)}), 403
    
    return decorated_function
