"""Debug routes for troubleshooting production issues."""
from flask import Blueprint, jsonify, current_app
import os

debug_bp = Blueprint('debug', __name__, url_prefix='/api/debug')

@debug_bp.route('/config', methods=['GET'])
def check_config():
    """Check environment configuration (safe for production)."""
    config = {
        'GOOGLE_GEMINI_API_KEY': 'SET' if os.getenv('GOOGLE_GEMINI_API_KEY') else 'NOT SET',
        'GOOGLE_GEMINI_API_KEY_LENGTH': len(os.getenv('GOOGLE_GEMINI_API_KEY', '')),
        'SUPABASE_URL': 'SET' if os.getenv('SUPABASE_URL') else 'NOT SET',
        'SUPABASE_KEY': 'SET' if os.getenv('SUPABASE_KEY') else 'NOT SET',
        'SUPABASE_SERVICE_KEY': 'SET' if os.getenv('SUPABASE_SERVICE_KEY') else 'NOT SET',
        'FRONTEND_URL': os.getenv('FRONTEND_URL', 'NOT SET'),
        'environment': os.getenv('FLASK_ENV', 'production'),
    }
    return jsonify(config), 200

@debug_bp.route('/gemini-test', methods=['GET'])
def test_gemini():
    """Test Gemini API connection."""
    try:
        import google.generativeai as genai
        
        api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
        if not api_key:
            return jsonify({
                'status': 'error',
                'message': 'GOOGLE_GEMINI_API_KEY not set in environment'
            }), 500
        
        genai.configure(api_key=api_key)
        
        # Try to list models
        models = list(genai.list_models())
        model_names = [m.name for m in models[:5]]  # First 5 models
        
        # Try a simple generation
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Say 'Hello, the API is working!'")
        
        return jsonify({
            'status': 'success',
            'message': 'Gemini API is working',
            'api_key_length': len(api_key),
            'models_found': len(models),
            'sample_models': model_names,
            'test_response': response.text
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error_type': type(e).__name__,
            'error_message': str(e),
            'api_key_set': bool(os.getenv('GOOGLE_GEMINI_API_KEY'))
        }), 500
