from flask import Blueprint, request, jsonify
from app.auth.api_key_auth import require_api_key
from app.modules.revops.services import RevOpsService
from app.modules.jobs.services import JobsService
from app.modules.customer_health.services import CustomerHealthService

# Public API Blueprint - for external integrations using API keys
public_api_bp = Blueprint('public_api', __name__, url_prefix='/api/v1')

# ============================================
# LEADS ENDPOINTS
# ============================================

@public_api_bp.route('/leads', methods=['GET'])
@require_api_key(['read:*', 'read:leads'])
def get_leads():
    """Get all leads - requires read:leads scope"""
    try:
        organization_id = request.organization_id
        leads = RevOpsService.get_all_leads(organization_id)
        return jsonify({'leads': leads}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@public_api_bp.route('/leads', methods=['POST'])
@require_api_key(['write:*', 'write:leads'])
def create_lead():
    """Create a new lead - requires write:leads scope"""
    try:
        organization_id = request.organization_id
        data = request.get_json()
        
        lead = RevOpsService.create_lead(
            organization_id,
            data.get('email'),
            data.get('name'),
            data.get('source'),
            data.get('status')
        )
        return jsonify({'lead': lead}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# JOBS ENDPOINTS
# ============================================

@public_api_bp.route('/jobs', methods=['GET'])
@require_api_key(['read:*', 'read:jobs'])
def get_jobs():
    """Get all jobs - requires read:jobs scope"""
    try:
        organization_id = request.organization_id
        jobs = JobsService.get_all_jobs(organization_id)
        return jsonify({'jobs': jobs}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@public_api_bp.route('/jobs', methods=['POST'])
@require_api_key(['write:*', 'write:jobs'])
def create_job():
    """Create a new job - requires write:jobs scope"""
    try:
        organization_id = request.organization_id
        data = request.get_json()
        
        job = JobsService.create_job(
            organization_id,
            data.get('title'),
            data.get('job_type'),
            data.get('description'),
            data.get('assigned_talent_id'),
            data.get('due_date')
        )
        return jsonify({'job': job}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# CUSTOMERS ENDPOINTS
# ============================================

@public_api_bp.route('/customers', methods=['GET'])
@require_api_key(['read:*', 'read:customers'])
def get_customers():
    """Get all customers - requires read:customers scope"""
    try:
        organization_id = request.organization_id
        customers = CustomerHealthService.get_all_customers(organization_id)
        return jsonify({'customers': customers}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# API INFO
# ============================================

@public_api_bp.route('/info', methods=['GET'])
@require_api_key()  # Any valid API key
def api_info():
    """Get API information and your permissions"""
    return jsonify({
        'version': '1.0',
        'organization_id': request.organization_id,
        'scopes': request.api_key_scopes,
        'endpoints': {
            'leads': {
                'GET /api/v1/leads': 'List all leads (read:leads)',
                'POST /api/v1/leads': 'Create lead (write:leads)'
            },
            'jobs': {
                'GET /api/v1/jobs': 'List all jobs (read:jobs)',
                'POST /api/v1/jobs': 'Create job (write:jobs)'
            },
            'customers': {
                'GET /api/v1/customers': 'List all customers (read:customers)'
            }
        }
    }), 200
