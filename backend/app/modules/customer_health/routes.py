"""Customer Health module routes."""
from flask import Blueprint, request, jsonify
from app.auth.decorators import require_auth, require_role
from .services import customer_health_service

customer_health_bp = Blueprint('customer_health', __name__)


@customer_health_bp.route('/customers', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_customers():
    """Get all customers with health scores."""
    org_id = request.organization_id
    filter_by = request.args.get('filter')  # at_risk, expansion, healthy
    result = customer_health_service.get_customers(org_id, filter_by)
    return jsonify(result), 200


@customer_health_bp.route('/customers/<customer_id>', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_customer(customer_id):
    """Get single customer with detailed health analysis."""
    org_id = request.organization_id
    result = customer_health_service.get_customer(org_id, customer_id)
    return jsonify(result), 200


@customer_health_bp.route('/customers', methods=['POST'])
@require_auth
@require_role('org_owner', 'org_member')
def create_customer():
    """Create a new customer."""
    org_id = request.organization_id
    data = request.get_json()
    result = customer_health_service.create_customer(org_id, data)
    return jsonify(result), 201


@customer_health_bp.route('/customers/upload', methods=['POST'])
@require_auth
@require_role('org_owner', 'org_member')
def upload_customers():
    """Upload customers from CSV."""
    org_id = request.organization_id
    file = request.files.get('file')
    
    if not file:
        return jsonify({'error': 'No file provided'}), 400
    
    try:
        result = customer_health_service.upload_customers_csv(org_id, file)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@customer_health_bp.route('/clear', methods=['DELETE'])
@require_auth
@require_role('org_owner')
def clear_customers():
    """Clear all customers for the organization."""
    org_id = request.organization_id
    result = customer_health_service.clear_customers(org_id)
    return jsonify(result), 200

@customer_health_bp.route('/dashboard', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_dashboard():
    """Get customer health dashboard statistics."""
    org_id = request.organization_id
    result = customer_health_service.get_dashboard_stats(org_id)
    return jsonify(result), 200


@customer_health_bp.route('/customers/analyze', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def analyze_customers():
    """Analyze customer health and generate AI insights."""
    org_id = request.organization_id
    print(f"[analyze_customers] Starting analysis for org: {org_id}")
    try:
        result = customer_health_service.analyze_customers_with_ai(org_id)
        print(f"[analyze_customers] Analysis result: {result}")
        return jsonify(result), 200
    except Exception as e:
        print(f"[analyze_customers] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@customer_health_bp.route('/customers/chat', methods=['POST'])
@require_auth
@require_role('org_owner', 'org_member')
def chat_with_customers():
    """Chat with AI about customers data."""
    org_id = request.organization_id
    user_id = request.user.id
    data = request.get_json()
    message = data.get('message', '')
    conversation_history = data.get('history', [])
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    try:
        result = customer_health_service.chat_about_customers(org_id, user_id, message, conversation_history)
        return jsonify(result), 200
    except Exception as e:
        print(f"[chat_with_customers] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
