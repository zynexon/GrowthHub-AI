from flask import Blueprint, request, jsonify
from .services import AuthService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user and create organization"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('fullName') or data.get('full_name')
    organization_name = data.get('organizationName') or data.get('organization_name')
    
    print(f"[SIGNUP] Received data: email={email}, fullName={full_name}, orgName={organization_name}")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    if not full_name:
        return jsonify({"error": "Full name is required"}), 400
        
    if not organization_name:
        return jsonify({"error": "Organization name is required"}), 400
    
    auth_service = AuthService()
    result = auth_service.signup(email, password, full_name, organization_name)
    
    print(f"[SIGNUP] Result: {result}")
    
    if 'error' in result:
        print(f"[SIGNUP] Error occurred: {result['error']}")
        return jsonify(result), 400
    
    return jsonify(result), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    auth_service = AuthService()
    result = auth_service.login(email, password)
    
    if 'error' in result:
        return jsonify(result), 401
    
    return jsonify(result), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Sign out user"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    
    auth_service = AuthService()
    result = auth_service.logout(token)
    
    if 'error' in result:
        return jsonify(result), 400
    
    return jsonify(result), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current user profile"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    
    if not token:
        return jsonify({"error": "Authorization token required"}), 401
    
    auth_service = AuthService()
    result = auth_service.get_user_profile(token)
    
    if 'error' in result:
        return jsonify(result), 401
    
    return jsonify(result), 200

@auth_bp.route('/organizations', methods=['GET'])
def get_organizations():
    """Get user's organizations"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    
    if not token:
        return jsonify({"error": "Authorization token required"}), 401
    
    auth_service = AuthService()
    result = auth_service.get_user_organizations(token)
    
    if 'error' in result:
        return jsonify(result), 401
    
    return jsonify(result), 200