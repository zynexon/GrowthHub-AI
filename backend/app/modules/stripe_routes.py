from flask import Blueprint, request, jsonify
from app.auth.decorators import require_auth, require_role
from app.modules.stripe_service import StripeService
import traceback

stripe_bp = Blueprint('stripe', __name__, url_prefix='/api/stripe')

@stripe_bp.route('/plans', methods=['GET'])
def get_plans():
    """Get available pricing plans"""
    try:
        return jsonify({'plans': StripeService.PLANS}), 200
    except Exception as e:
        print(f"Error fetching plans: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@stripe_bp.route('/subscription', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def get_subscription():
    """Get current subscription information"""
    try:
        organization_id = request.organization_id
        subscription = StripeService.get_subscription_info(organization_id)
        return jsonify(subscription), 200
    except Exception as e:
        print(f"Error fetching subscription: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@stripe_bp.route('/check-limit/<resource_type>', methods=['GET'])
@require_auth
@require_role('org_owner', 'org_member')
def check_limit(resource_type):
    """Check if organization has reached limit for a resource"""
    try:
        organization_id = request.organization_id
        limit_info = StripeService.check_limit(organization_id, resource_type)
        return jsonify(limit_info), 200
    except Exception as e:
        print(f"Error checking limit: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@stripe_bp.route('/create-checkout-session', methods=['POST'])
@require_auth
@require_role('org_owner')
def create_checkout_session():
    """Create a Stripe checkout session"""
    try:
        data = request.get_json()
        organization_id = request.organization_id
        plan_type = data.get('plan_type')
        
        if not plan_type:
            return jsonify({'error': 'Plan type is required'}), 400
        
        # Create checkout session
        session = StripeService.create_checkout_session(
            organization_id=organization_id,
            plan_type=plan_type,
            success_url=data.get('success_url', f"{request.host_url}settings?success=true"),
            cancel_url=data.get('cancel_url', f"{request.host_url}settings?canceled=true")
        )
        
        return jsonify(session), 200
    except Exception as e:
        print(f"Error creating checkout session: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@stripe_bp.route('/create-portal-session', methods=['POST'])
@require_auth
@require_role('org_owner')
def create_portal_session():
    """Create a Stripe customer portal session"""
    try:
        data = request.get_json()
        organization_id = request.organization_id
        
        session = StripeService.create_customer_portal_session(
            organization_id=organization_id,
            return_url=data.get('return_url', f"{request.host_url}settings")
        )
        
        return jsonify(session), 200
    except Exception as e:
        print(f"Error creating portal session: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@stripe_bp.route('/webhook', methods=['POST'])
def webhook():
    """Handle Stripe webhook events"""
    try:
        payload = request.get_data()
        signature = request.headers.get('Stripe-Signature')
        
        result = StripeService.handle_webhook(payload, signature)
        return jsonify(result), 200
    except Exception as e:
        print(f"Error handling webhook: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400
