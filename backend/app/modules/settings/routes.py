from flask import Blueprint, request, jsonify
from app.auth.decorators import require_auth, require_role
from app.modules.settings.services import SettingsService

settings_bp = Blueprint('settings', __name__, url_prefix='/api/settings')

# Organization Settings Endpoints
@settings_bp.route('/organization', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_organization_settings():
    """Get organization settings"""
    try:
        organization_id = request.headers.get('X-Organization-Id')
        settings = SettingsService.get_organization_settings(organization_id)
        
        if not settings:
            return jsonify({'error': 'Settings not found'}), 404
        
        return jsonify(settings), 200
    except Exception as e:
        print(f"Error getting organization settings: {e}")
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/organization', methods=['PATCH'])
@require_auth
@require_role('org_owner')  # Only owners can update org settings
def update_organization_settings():
    """Update organization settings"""
    try:
        data = request.get_json()
        organization_id = request.headers.get('X-Organization-Id')
        
        # Allowed fields to update
        allowed_fields = ['industry', 'company_size', 'timezone', 'default_currency']
        updates = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not updates:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        settings = SettingsService.update_organization_settings(organization_id, updates)
        
        if not settings:
            return jsonify({'error': 'Failed to update settings'}), 500
        
        return jsonify(settings), 200
    except Exception as e:
        print(f"Error updating organization settings: {e}")
        return jsonify({'error': str(e)}), 500

# User Profile Endpoints
@settings_bp.route('/profile', methods=['GET'])
@require_auth
def get_user_profile():
    """Get current user profile"""
    try:
        user_id = request.user_id
        profile = SettingsService.get_user_profile(user_id)
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        return jsonify(profile), 200
    except Exception as e:
        print(f"Error getting user profile: {e}")
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/profile', methods=['PATCH'])
@require_auth
def update_user_profile():
    """Update current user profile"""
    try:
        data = request.get_json()
        user_id = request.user_id
        
        # Allowed fields to update
        allowed_fields = ['full_name', 'email']
        updates = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not updates:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        profile = SettingsService.update_user_profile(user_id, updates)
        
        if not profile:
            return jsonify({'error': 'Failed to update profile'}), 500
        
        return jsonify(profile), 200
    except Exception as e:
        print(f"Error updating user profile: {e}")
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/profile/password', methods=['POST'])
@require_auth
def change_password():
    """Change user password"""
    try:
        data = request.get_json()
        user_id = request.user_id
        new_password = data.get('new_password')
        
        if not new_password:
            return jsonify({'error': 'new_password is required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        success = SettingsService.change_password(user_id, new_password)
        
        if not success:
            return jsonify({'error': 'Failed to change password'}), 500
        
        return jsonify({'message': 'Password changed successfully'}), 200
    except Exception as e:
        print(f"Error changing password: {e}")
        return jsonify({'error': str(e)}), 500

# Notification Preferences Endpoints
@settings_bp.route('/notifications', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_notification_preferences():
    """Get notification preferences"""
    try:
        user_id = request.user_id
        organization_id = request.headers.get('X-Organization-Id')
        
        preferences = SettingsService.get_notification_preferences(user_id, organization_id)
        
        if not preferences:
            return jsonify({'error': 'Preferences not found'}), 404
        
        return jsonify(preferences), 200
    except Exception as e:
        print(f"Error getting notification preferences: {e}")
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/notifications', methods=['PATCH'])
@require_auth
@require_role('org_owner', 'org_member')
def update_notification_preferences():
    """Update notification preferences"""
    try:
        data = request.get_json()
        user_id = request.user_id
        organization_id = request.headers.get('X-Organization-Id')
        
        # Allowed fields to update
        allowed_fields = ['customer_health_alerts', 'churn_risk_alerts', 'job_status_updates']
        updates = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not updates:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        preferences = SettingsService.update_notification_preferences(user_id, organization_id, updates)
        
        if not preferences:
            return jsonify({'error': 'Failed to update preferences'}), 500
        
        return jsonify(preferences), 200
    except Exception as e:
        print(f"Error updating notification preferences: {e}")
        return jsonify({'error': str(e)}), 500

# Billing & Plan Endpoints
@settings_bp.route('/billing', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_billing_info():
    """Get billing and plan information"""
    try:
        organization_id = request.headers.get('X-Organization-Id')
        billing = SettingsService.get_billing_info(organization_id)
        
        if not billing:
            return jsonify({'error': 'Billing info not found'}), 404
        
        return jsonify(billing), 200
    except Exception as e:
        print(f"Error getting billing info: {e}")
        return jsonify({'error': str(e)}), 500
