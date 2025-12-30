"""Initialize Flask extensions."""
from supabase import create_client, Client
from flask import Flask
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize extensions
supabase_client: Client = None
supabase_admin_client: Client = None

def init_extensions(app: Flask):
    """Initialize all extensions with app context."""
    global supabase_client, supabase_admin_client
    
    # Get Supabase credentials from environment
    supabase_url = os.getenv('SUPABASE_URL') or app.config.get('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY') or app.config.get('SUPABASE_KEY')
    supabase_service_key = os.getenv('SUPABASE_SERVICE_KEY') or app.config.get('SUPABASE_SERVICE_KEY')
    
    if not supabase_url or not supabase_key:
        raise ValueError(
            "Missing Supabase credentials!\n"
            f"SUPABASE_URL: {'✓' if supabase_url else '✗'}\n"
            f"SUPABASE_KEY: {'✓' if supabase_key else '✗'}"
        )
    
    # Initialize Supabase (version 2.0.0)
    try:
        # Regular client for normal operations
        supabase_client = create_client(supabase_url, supabase_key)
        
        # Admin client with service key for privileged operations (like user creation)
        if supabase_service_key:
            supabase_admin_client = create_client(supabase_url, supabase_service_key)
            # Set service role authorization on the postgrest client
            supabase_admin_client.postgrest.auth(supabase_service_key)
        else:
            supabase_admin_client = supabase_client
            
        print(f"✓ Supabase initialized successfully")
        print(f"✓ Admin client configured with service key: {'Yes' if supabase_service_key else 'No'}")
    except Exception as e:
        print(f"✗ Supabase init error: {e}")
        raise
    
    # Store in app context
    app.supabase = supabase_client
    app.supabase_admin = supabase_admin_client
    
    return app


def get_supabase() -> Client:
    """Get Supabase client - returns global instance"""
    if supabase_client is None:
        raise RuntimeError("Supabase client not initialized")
    return supabase_client


def get_supabase_admin() -> Client:
    """Get Supabase admin client with elevated privileges"""
    if supabase_admin_client is None:
        raise RuntimeError("Supabase admin client not initialized")
    return supabase_admin_client
