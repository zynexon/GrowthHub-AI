"""RevOps module routes."""
from flask import Blueprint, request, jsonify
from app.auth.decorators import require_auth, require_role
from .services import revops_service

revops_bp = Blueprint('revops', __name__)


@revops_bp.route('/leads', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_leads():
    """Get all leads for organization."""
    org_id = request.organization_id
    sort_by = request.args.get('sort_by', 'score')
    result = revops_service.get_leads(org_id, sort_by)
    return jsonify(result), 200


@revops_bp.route('/leads', methods=['POST'])
@require_auth
@require_role('org_owner', 'org_member')
def create_lead():
    """Create a new lead."""
    org_id = request.organization_id
    data = request.get_json()
    result = revops_service.create_lead(org_id, data)
    return jsonify(result), 201


@revops_bp.route('/leads/upload', methods=['POST'])
@require_auth
@require_role('org_owner', 'org_member')
def upload_leads():
    """Upload leads from CSV."""
    org_id = request.organization_id
    file = request.files.get('file')
    
    print(f"[upload_leads] File received: {file}")
    print(f"[upload_leads] Request files: {request.files}")
    print(f"[upload_leads] File name: {file.filename if file else 'None'}")
    
    if not file:
        return jsonify({'error': 'No file provided'}), 400
    
    try:
        result = revops_service.upload_leads_csv(org_id, file)
        return jsonify(result), 201
    except Exception as e:
        print(f"[upload_leads] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400


@revops_bp.route('/leads/<lead_id>', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_lead(lead_id):
    """Get single lead details with score breakdown."""
    org_id = request.organization_id
    result = revops_service.get_lead(org_id, lead_id)
    return jsonify(result), 200


@revops_bp.route('/leads/<lead_id>', methods=['PUT'])
@require_auth
@require_role('org_owner', 'org_member')
def update_lead(lead_id):
    """Update lead (recalculates score automatically)."""
    org_id = request.organization_id
    data = request.get_json()
    result = revops_service.update_lead(org_id, lead_id, data)
    return jsonify(result), 200


@revops_bp.route('/leads/clear', methods=['DELETE'])
@require_auth
@require_role('org_owner')
def clear_leads():
    """Clear all leads for the organization."""
    org_id = request.organization_id
    result = revops_service.clear_leads(org_id)
    return jsonify(result), 200


# Campaign routes

@revops_bp.route('/campaigns', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_campaigns():
    """Get all campaigns with ROI metrics."""
    org_id = request.organization_id
    result = revops_service.get_campaigns(org_id)
    return jsonify(result), 200


@revops_bp.route('/campaigns', methods=['POST'])
@require_auth
@require_role('org_owner', 'org_member')
def create_campaign():
    """Create a new campaign."""
    org_id = request.organization_id
    data = request.get_json()
    result = revops_service.create_campaign(org_id, data)
    return jsonify(result), 201


@revops_bp.route('/campaigns/clear', methods=['DELETE'])
@require_auth
@require_role('org_owner')
def clear_campaigns():
    """Clear all campaigns for the organization."""
    org_id = request.organization_id
    result = revops_service.clear_campaigns(org_id)
    return jsonify(result), 200


@revops_bp.route('/campaigns/upload', methods=['POST'])
@require_auth
@require_role('org_owner', 'org_member')
def upload_campaigns():
    """Upload campaigns from CSV."""
    org_id = request.organization_id
    file = request.files.get('file')
    
    if not file:
        return jsonify({'error': 'No file provided'}), 400
    
    try:
        result = revops_service.upload_campaigns_csv(org_id, file)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# Dashboard route

@revops_bp.route('/dashboard', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_dashboard():
    """Get RevOps dashboard statistics."""
    org_id = request.organization_id
    result = revops_service.get_dashboard_stats(org_id)
    return jsonify(result), 200
    org_id = request.organization_id
    result = revops_service.get_campaigns(org_id)
    return jsonify(result), 200
