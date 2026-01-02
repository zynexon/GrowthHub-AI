from flask import Blueprint, request, jsonify
from app.auth.decorators import require_auth, require_role
from app.modules.api_keys.services import APIKeyService
import traceback

api_keys_bp = Blueprint('api_keys', __name__, url_prefix='/api/api-keys')

@api_keys_bp.route('', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_all_keys():
    """Get all API keys for the organization"""
    try:
        organization_id = request.organization_id
        keys = APIKeyService.get_all_keys(organization_id)
        return jsonify({'keys': keys}), 200
    except Exception as e:
        print(f"Error fetching API keys: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@api_keys_bp.route('/statistics', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_statistics():
    """Get API key statistics"""
    try:
        organization_id = request.organization_id
        stats = APIKeyService.get_statistics(organization_id)
        return jsonify(stats), 200
    except Exception as e:
        print(f"Error fetching statistics: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@api_keys_bp.route('', methods=['POST'])
@require_auth
@require_role('org_owner')  # Only owners can create API keys
def create_key():
    """Create a new API key"""
    try:
        organization_id = request.organization_id
        data = request.get_json()
        
        name = data.get('name')
        scopes = data.get('scopes', ['read:*'])
        expires_in_days = data.get('expires_in_days')
        
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        key_info = APIKeyService.create_api_key(
            organization_id,
            name,
            scopes,
            expires_in_days
        )
        
        return jsonify({
            'key': key_info,
            'message': 'API key created successfully. Save it now - you won\'t see it again!'
        }), 201
    except Exception as e:
        print(f"Error creating API key: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@api_keys_bp.route('/<key_id>/revoke', methods=['PATCH'])
@require_auth
@require_role('org_owner')
def revoke_key(key_id):
    """Revoke an API key"""
    try:
        organization_id = request.organization_id
        key = APIKeyService.revoke_key(organization_id, key_id)
        
        if not key:
            return jsonify({'error': 'API key not found'}), 404
        
        return jsonify({'key': key}), 200
    except Exception as e:
        print(f"Error revoking API key: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@api_keys_bp.route('/<key_id>', methods=['DELETE'])
@require_auth
@require_role('org_owner')
def delete_key(key_id):
    """Delete an API key"""
    try:
        organization_id = request.organization_id
        APIKeyService.delete_key(organization_id, key_id)
        return jsonify({'message': 'API key deleted'}), 200
    except Exception as e:
        print(f"Error deleting API key: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
