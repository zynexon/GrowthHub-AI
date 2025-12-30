"""Data labeling routes."""
from flask import Blueprint, request, jsonify, make_response
from app.auth.decorators import require_auth, require_role
from app.modules.data_labeling.services import DataLabelingService

data_labeling_bp = Blueprint('data_labeling', __name__, url_prefix='/api/data-labeling')
service = DataLabelingService()


@data_labeling_bp.route('/datasets', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_datasets():
    """Get all datasets for organization."""
    result = service.get_datasets(request.organization_id)
    return jsonify(result)


@data_labeling_bp.route('/datasets/<dataset_id>', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_dataset(dataset_id):
    """Get single dataset."""
    result = service.get_dataset(request.organization_id, dataset_id)
    return jsonify(result)


@data_labeling_bp.route('/datasets', methods=['POST'])
@require_auth
@require_role('org_owner', 'org_member')
def create_dataset():
    """Upload CSV and create dataset."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    name = request.form.get('name')
    label_type = request.form.get('label_type')
    
    if not name or not label_type:
        return jsonify({'error': 'name and label_type are required'}), 400
    
    if label_type not in ['intent', 'sentiment']:
        return jsonify({'error': 'label_type must be intent or sentiment'}), 400
    
    result = service.create_dataset(request.organization_id, name, label_type, file)
    return jsonify(result), 201


@data_labeling_bp.route('/datasets/<dataset_id>/next', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_next_row(dataset_id):
    """Get next unlabeled row."""
    result = service.get_next_unlabeled_row(dataset_id)
    return jsonify(result)


@data_labeling_bp.route('/datasets/<dataset_id>/label', methods=['POST'])
@require_auth
@require_role('org_owner', 'org_member')
def label_row(dataset_id):
    """Label a row."""
    data = request.json
    row_id = data.get('row_id')
    label = data.get('label')
    
    if not row_id or not label:
        return jsonify({'error': 'row_id and label are required'}), 400
    
    result = service.label_row(dataset_id, row_id, label)
    return jsonify(result)


@data_labeling_bp.route('/datasets/<dataset_id>/skip', methods=['POST'])
@require_auth
@require_role('org_owner', 'org_member')
def skip_row(dataset_id):
    """Skip a row."""
    data = request.json
    row_id = data.get('row_id')
    
    if not row_id:
        return jsonify({'error': 'row_id is required'}), 400
    
    result = service.skip_row(dataset_id, row_id)
    return jsonify(result)


@data_labeling_bp.route('/datasets/<dataset_id>/export', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def export_dataset(dataset_id):
    """Export labeled data as CSV."""
    try:
        result = service.export_dataset(request.organization_id, dataset_id)
        
        response = make_response(result['csv'])
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename={result["filename"]}'
        return response
    except Exception as e:
        print(f"Export error: {str(e)}")
        return jsonify({'error': f'Export failed: {str(e)}'}), 500


@data_labeling_bp.route('/datasets/<dataset_id>/complete', methods=['POST'])
@require_auth
@require_role('org_owner', 'org_member')
def mark_completed(dataset_id):
    """Mark dataset as completed."""
    result = service.mark_dataset_completed(request.organization_id, dataset_id)
    return jsonify(result)
