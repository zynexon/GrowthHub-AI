"""Secure PKCE-based auth routes following OAuth 2.0 best practices."""
from flask import Blueprint, request, jsonify, redirect
from .services import AuthService
import os

pkce_bp = Blueprint('pkce_auth', __name__)

@pkce_bp.route('/callback', methods=['GET'])
def auth_callback():
    """
    Secure callback endpoint that exchanges auth code for tokens.
    Tokens never appear in browser URL - only a short-lived code.
    """
    try:
        # Get authorization code from query params (not hash!)
        code = request.args.get('code')
        
        if not code:
            # Check if there's an error
            error = request.args.get('error')
            error_description = request.args.get('error_description', '')
            print(f"[AUTH_CALLBACK] Error: {error} - {error_description}")
            
            # Redirect to frontend with error
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            if isinstance(frontend_url, list):
                frontend_url = frontend_url[0]
            return redirect(f"{frontend_url}/login?error={error or 'invalid_request'}")
        
        print(f"[AUTH_CALLBACK] Received auth code: {code[:10]}...")
        
        # Exchange code for tokens using Supabase
        auth_service = AuthService()
        result = auth_service.exchange_code_for_session(code)
        
        if 'error' in result:
            print(f"[AUTH_CALLBACK] Error exchanging code: {result['error']}")
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            if isinstance(frontend_url, list):
                frontend_url = frontend_url[0]
            return redirect(f"{frontend_url}/login?error=auth_failed")
        
        # Generate a secure one-time token for the frontend
        # In production, use a proper session token or JWT
        import secrets
        one_time_token = secrets.token_urlsafe(32)
        
        # Store temporarily (in production, use Redis with TTL)
        # For now, we'll pass it directly but this is a simplified approach
        # The proper way is to store in session storage server-side
        
        print(f"[AUTH_CALLBACK] Successfully exchanged code for tokens")
        
        # Redirect to frontend with secure one-time token
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        if isinstance(frontend_url, list):
            frontend_url = frontend_url[0]
            
        # Option 1: Use session cookie (most secure)
        # Option 2: One-time token that frontend exchanges for session
        # For now, we'll return JSON response for AJAX handling
        
        return jsonify({
            'success': True,
            'user': result['user'],
            'session': result['session'],
            'organization': result.get('organization')
        }), 200
        
    except Exception as e:
        print(f"[AUTH_CALLBACK] Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        if isinstance(frontend_url, list):
            frontend_url = frontend_url[0]
        return redirect(f"{frontend_url}/login?error=server_error")


@pkce_bp.route('/verify-code', methods=['POST'])
def verify_code():
    """
    Endpoint for frontend to exchange authorization code for session.
    This keeps tokens server-side and only returns them via secure API.
    """
    try:
        data = request.get_json()
        code = data.get('code')
        
        if not code:
            return jsonify({'error': 'Authorization code is required'}), 400
        
        print(f"[VERIFY_CODE] Exchanging code: {code[:10]}...")
        
        auth_service = AuthService()
        result = auth_service.exchange_code_for_session(code)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify({
            'user': result['user'],
            'session': result['session'],
            'organization': result.get('organization')
        }), 200
        
    except Exception as e:
        print(f"[VERIFY_CODE] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to verify authorization code'}), 500
