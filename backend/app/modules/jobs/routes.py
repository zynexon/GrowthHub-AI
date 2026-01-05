from flask import Blueprint, request, jsonify
from app.auth.decorators import require_auth, require_role
from app.auth.limit_decorators import require_limit
from app.modules.jobs.services import JobsService

jobs_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')

@jobs_bp.route('', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_all_jobs():
    """Get all jobs for the organization"""
    try:
        organization_id = request.organization_id
        jobs = JobsService.get_all_jobs(organization_id)
        return jsonify({'jobs': jobs}), 200
    except Exception as e:
        print(f"Error fetching jobs: {str(e)}")
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/statistics', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_statistics():
    """Get job statistics"""
    try:
        organization_id = request.organization_id
        stats = JobsService.get_statistics(organization_id)
        return jsonify(stats), 200
    except Exception as e:
        print(f"Error fetching statistics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<job_id>', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_job(job_id):
    """Get single job by ID"""
    try:
        organization_id = request.organization_id
        job = JobsService.get_job(organization_id, job_id)
        return jsonify({'job': job}), 200
    except Exception as e:
        print(f"Error fetching job: {str(e)}")
        return jsonify({'error': str(e)}), 404

@jobs_bp.route('', methods=['POST'])
@require_auth
@require_role('org_owner', 'org_member')
@require_limit('jobs')
def create_job():
    """Create new job"""
    try:
        organization_id = request.organization_id
        data = request.get_json()
        
        title = data.get('title')
        job_type = data.get('job_type')
        description = data.get('description')
        assigned_talent_id = data.get('assigned_talent_id')
        due_date = data.get('due_date')
        
        if not all([title, job_type]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        job = JobsService.create_job(
            organization_id, 
            title, 
            job_type, 
            description, 
            assigned_talent_id, 
            due_date
        )
        return jsonify({'job': job}), 201
    except Exception as e:
        print(f"Error creating job: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<job_id>', methods=['PUT'])
@require_auth
@require_role('org_owner', 'org_member')
def update_job(job_id):
    """Update job information"""
    try:
        organization_id = request.organization_id
        data = request.get_json()
        
        job = JobsService.update_job(
            organization_id,
            job_id,
            title=data.get('title'),
            job_type=data.get('job_type'),
            description=data.get('description'),
            assigned_talent_id=data.get('assigned_talent_id'),
            due_date=data.get('due_date'),
            status=data.get('status')
        )
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        return jsonify({'job': job}), 200
    except Exception as e:
        print(f"Error updating job: {str(e)}")
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<job_id>/complete', methods=['PATCH'])
@require_auth
@require_role('org_owner', 'org_member')
def mark_completed(job_id):
    """Mark job as completed"""
    try:
        organization_id = request.organization_id
        job = JobsService.mark_completed(organization_id, job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        return jsonify({'job': job}), 200
    except Exception as e:
        print(f"Error marking job as completed: {str(e)}")
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<job_id>', methods=['DELETE'])
@require_auth
@require_role('org_owner', 'org_member')
def delete_job(job_id):
    """Delete job"""
    try:
        organization_id = request.organization_id
        JobsService.delete_job(organization_id, job_id)
        return jsonify({'message': 'Job deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting job: {str(e)}")
        return jsonify({'error': str(e)}), 500
