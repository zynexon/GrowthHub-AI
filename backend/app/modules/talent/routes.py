from flask import Blueprint, request, jsonify
from app.auth.decorators import require_auth, require_role
from app.auth.limit_decorators import require_limit
from app.modules.talent.services import TalentService

talent_bp = Blueprint('talent', __name__, url_prefix='/api/talent')

@talent_bp.route('', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_all_talent():
    """Get all talent for the organization"""
    try:
        organization_id = request.organization_id
        talent_list = TalentService.get_all_talent(organization_id)
        return jsonify({'talent': talent_list}), 200
    except Exception as e:
        print(f"Error fetching talent: {str(e)}")
        return jsonify({'error': str(e)}), 500

@talent_bp.route('/statistics', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_statistics():
    """Get talent statistics"""
    try:
        organization_id = request.organization_id
        stats = TalentService.get_statistics(organization_id)
        return jsonify(stats), 200
    except Exception as e:
        print(f"Error fetching statistics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@talent_bp.route('/<talent_id>', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_talent(talent_id):
    """Get single talent by ID"""
    try:
        organization_id = request.organization_id
        talent = TalentService.get_talent(organization_id, talent_id)
        return jsonify({'talent': talent}), 200
    except Exception as e:
        print(f"Error fetching talent: {str(e)}")
        return jsonify({'error': str(e)}), 404

@talent_bp.route('', methods=['POST'])
@require_auth
@require_role('org_owner', 'org_member')
@require_limit('talent')
def create_talent():
    """Create new talent"""
    try:
        organization_id = request.organization_id
        data = request.get_json()
        
        print(f"Creating talent for organization: {organization_id}")
        print(f"Request data: {data}")
        
        name = data.get('name')
        email = data.get('email')
        skill_type = data.get('skill_type')
        primary_skill = data.get('primary_skill')
        secondary_skill = data.get('secondary_skill')
        bio = data.get('bio')
        
        if not all([name, email, skill_type]):
            print("Missing required fields")
            return jsonify({'error': 'Missing required fields'}), 400
        
        print(f"Calling TalentService.create_talent with: name={name}, email={email}, skill_type={skill_type}")
        talent = TalentService.create_talent(organization_id, name, email, skill_type, primary_skill, secondary_skill, bio)
        print(f"Talent created successfully: {talent}")
        return jsonify({'talent': talent}), 201
    except Exception as e:
        print(f"Error creating talent: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@talent_bp.route('/<talent_id>', methods=['PUT'])
@require_auth
@require_role('org_owner', 'org_member')
def update_talent(talent_id):
    """Update talent information"""
    try:
        organization_id = request.organization_id
        data = request.get_json()
        
        talent = TalentService.update_talent(
            organization_id,
            talent_id,
            name=data.get('name'),
            email=data.get('email'),
            skill_type=data.get('skill_type'),
            primary_skill=data.get('primary_skill'),
            secondary_skill=data.get('secondary_skill'),
            bio=data.get('bio')
        )
        
        if not talent:
            return jsonify({'error': 'Talent not found'}), 404
        
        return jsonify({'talent': talent}), 200
    except Exception as e:
        print(f"Error updating talent: {str(e)}")
        return jsonify({'error': str(e)}), 500

@talent_bp.route('/<talent_id>/status', methods=['PATCH'])
@require_auth
@require_role('org_owner', 'org_member')
def toggle_status(talent_id):
    """Toggle talent status"""
    try:
        organization_id = request.organization_id
        talent = TalentService.toggle_status(organization_id, talent_id)
        
        if not talent:
            return jsonify({'error': 'Talent not found'}), 404
        
        return jsonify({'talent': talent}), 200
    except Exception as e:
        print(f"Error toggling status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@talent_bp.route('/<talent_id>', methods=['DELETE'])
@require_auth
@require_role('org_owner', 'org_member')
def delete_talent(talent_id):
    """Delete talent"""
    try:
        organization_id = request.organization_id
        TalentService.delete_talent(organization_id, talent_id)
        return jsonify({'message': 'Talent deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting talent: {str(e)}")
        return jsonify({'error': str(e)}), 500
