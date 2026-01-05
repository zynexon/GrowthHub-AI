"""Flask application factory."""
from flask import Flask
from flask_cors import CORS
from .config import config
from .extensions import init_extensions

def create_app(config_name='development'):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    init_extensions(app)
    
    # Configure CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['FRONTEND_URL'],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization", "X-Organization-Id"]
        }
    })
    
    # Register blueprints
    from .auth.routes import auth_bp
    from .modules.revops.routes import revops_bp
    from .modules.customer_health.routes import customer_health_bp
    from .modules.data_labeling.routes import data_labeling_bp
    from .modules.talent.routes import talent_bp
    from .modules.jobs.routes import jobs_bp
    from .modules.api_keys.routes import api_keys_bp
    from .modules.settings.routes import settings_bp
    from .modules.stripe_routes import stripe_bp
    from .api.public_routes import public_api_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(revops_bp, url_prefix='/api/revops')
    app.register_blueprint(customer_health_bp, url_prefix='/api/customer-health')
    app.register_blueprint(data_labeling_bp, url_prefix='/api/data-labeling')
    app.register_blueprint(talent_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(api_keys_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(stripe_bp)
    app.register_blueprint(public_api_bp)  # Public API with API key auth
    
    # Health check endpoint
    @app.route('/health')
    def health():
        return {'status': 'healthy'}, 200
    
    return app
