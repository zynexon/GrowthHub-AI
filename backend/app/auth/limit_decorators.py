from functools import wraps
from flask import request, jsonify
from app.modules.stripe_service import StripeService

def require_limit(resource_type):
    """Decorator to check subscription limits before allowing resource creation"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                organization_id = request.organization_id
                limit_info = StripeService.check_limit(organization_id, resource_type)
                
                if not limit_info['allowed']:
                    return jsonify({
                        'error': 'Subscription limit reached',
                        'message': f"You've reached the limit for {resource_type} on your current plan",
                        'limit': limit_info['limit'],
                        'current': limit_info['current'],
                        'upgrade_required': True
                    }), 403
                
                return f(*args, **kwargs)
            except Exception as e:
                print(f"Error checking limit: {str(e)}")
                # Allow operation if limit check fails (fail open)
                return f(*args, **kwargs)
        
        return decorated_function
    return decorator
