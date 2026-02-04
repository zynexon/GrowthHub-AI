import os
from app.extensions import get_supabase_admin
import stripe

# Initialize Stripe with the API key
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

if not stripe.api_key:
    print("[STRIPE] WARNING: STRIPE_SECRET_KEY not configured!")
else:
    print(f"[STRIPE] Configured with key: {stripe.api_key[:15]}...")

class StripeService:
    
    # Pricing plans configuration
    PLANS = {
        'free': {
            'name': 'Free',
            'price': 0,
            'features': [
                '1 dataset (max 100 rows)',
                '3 talent profiles',
                '3 jobs',
                'Choose Intent OR Sentiment',
                'Manual labeling only',
                'No exports',
                'No API access'
            ],
            'limits': {
                'datasets': 1,
                'max_rows_per_dataset': 100,
                'total_rows': 100,
                'label_types': 1,  # Can choose either Intent OR Sentiment
                'can_export': False,
                'talent_profiles': 3,
                'jobs': 3,
                'api_access': False,
                'api_rate_limit': 0
            }
        },
        'pro': {
            'name': 'Pro',
            'price': 4900,  # $49.00 in cents
            'stripe_price_id': os.getenv('STRIPE_PRO_PRICE_ID'),
            'features': [
                'Up to 10 datasets',
                'Up to 10,000 rows total',
                'Intent AND Sentiment',
                'Export labeled CSV',
                'Progress tracking',
                '20 talent profiles',
                'Unlimited jobs',
                'Job status tracking',
                'Limited API access'
            ],
            'limits': {
                'datasets': 10,
                'max_rows_per_dataset': 10000,
                'total_rows': 10000,
                'label_types': 2,  # Both Intent AND Sentiment
                'can_export': True,
                'talent_profiles': 20,
                'jobs': -1,  # unlimited
                'api_access': True,
                'api_rate_limit': 1000  # requests per day
            }
        },
        'enterprise': {
            'name': 'Enterprise',
            'price': 19900,  # $199.00 in cents
            'stripe_price_id': os.getenv('STRIPE_ENTERPRISE_PRICE_ID'),
            'features': [
                'Unlimited datasets',
                'Unlimited rows',
                'All label types',
                'Unlimited talent profiles',
                'Unlimited jobs',
                'Skill tags',
                'Full API access',
                'Priority support'
            ],
            'limits': {
                'datasets': -1,  # unlimited
                'max_rows_per_dataset': -1,  # unlimited
                'total_rows': -1,  # unlimited
                'label_types': -1,  # all
                'can_export': True,
                'talent_profiles': -1,  # unlimited
                'jobs': -1,  # unlimited
                'api_access': True,
                'api_rate_limit': -1  # unlimited
            }
        }
    }
    
    @staticmethod
    def create_checkout_session(organization_id, plan_type, success_url, cancel_url):
        """Create a Stripe checkout session"""
        supabase = get_supabase_admin()
        
        # Get organization
        org = supabase.table('organizations').select('*').eq('id', organization_id).single().execute()
        if not org.data:
            raise Exception('Organization not found')
        
        # Get plan details
        plan = StripeService.PLANS.get(plan_type)
        if not plan or plan_type == 'free':
            raise Exception('Invalid plan type')
        
        # Create or get Stripe customer
        customer_id = org.data.get('stripe_customer_id')
        if not customer_id:
            customer = stripe.Customer.create(
                email=org.data.get('email'),
                metadata={'organization_id': organization_id}
            )
            customer_id = customer.id
            
            # Update organization with customer ID
            supabase.table('organizations').update({
                'stripe_customer_id': customer_id
            }).eq('id', organization_id).execute()
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': plan['stripe_price_id'],
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'organization_id': organization_id,
                'plan_type': plan_type
            }
        )
        
        return {
            'session_id': session.id,
            'url': session.url
        }
    
    @staticmethod
    def create_customer_portal_session(organization_id, return_url):
        """Create a Stripe customer portal session for managing subscriptions"""
        supabase = get_supabase_admin()
        
        # Get organization
        org = supabase.table('organizations').select('*').eq('id', organization_id).single().execute()
        if not org.data or not org.data.get('stripe_customer_id'):
            raise Exception('No Stripe customer found')
        
        # Create portal session
        session = stripe.billing_portal.Session.create(
            customer=org.data['stripe_customer_id'],
            return_url=return_url
        )
        
        return {'url': session.url}
    
    @staticmethod
    def handle_webhook(payload, signature):
        """Handle Stripe webhook events"""
        supabase = get_supabase_admin()
        
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, os.getenv('STRIPE_WEBHOOK_SECRET')
            )
        except ValueError:
            raise Exception('Invalid payload')
        except stripe.error.SignatureVerificationError:
            raise Exception('Invalid signature')
        
        # Handle different event types
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            organization_id = session['metadata']['organization_id']
            plan_type = session['metadata']['plan_type']
            
            # Update organization
            supabase.table('organizations').update({
                'plan_type': plan_type,
                'stripe_subscription_id': session.get('subscription'),
                'subscription_status': 'active'
            }).eq('id', organization_id).execute()
            
        elif event['type'] == 'customer.subscription.updated':
            subscription = event['data']['object']
            customer_id = subscription['customer']
            
            # Find organization
            org = supabase.table('organizations').select('*').eq('stripe_customer_id', customer_id).single().execute()
            if org.data:
                supabase.table('organizations').update({
                    'subscription_status': subscription['status'],
                    'current_period_start': subscription['current_period_start'],
                    'current_period_end': subscription['current_period_end']
                }).eq('id', org.data['id']).execute()
                
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            customer_id = subscription['customer']
            
            # Find organization and downgrade to free
            org = supabase.table('organizations').select('*').eq('stripe_customer_id', customer_id).single().execute()
            if org.data:
                supabase.table('organizations').update({
                    'plan_type': 'free',
                    'subscription_status': 'canceled',
                    'stripe_subscription_id': None
                }).eq('id', org.data['id']).execute()
                
        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            customer_id = invoice['customer']
            
            # Find organization and record payment
            org = supabase.table('organizations').select('*').eq('stripe_customer_id', customer_id).single().execute()
            if org.data:
                supabase.table('payment_history').insert({
                    'organization_id': org.data['id'],
                    'stripe_payment_intent_id': invoice.get('payment_intent'),
                    'stripe_invoice_id': invoice['id'],
                    'amount': invoice['amount_paid'],
                    'currency': invoice['currency'],
                    'status': 'succeeded',
                    'description': f"Payment for {invoice['lines']['data'][0]['description'] if invoice['lines']['data'] else 'subscription'}"
                }).execute()
                
        elif event['type'] == 'invoice.payment_failed':
            invoice = event['data']['object']
            customer_id = invoice['customer']
            
            # Find organization and update status
            org = supabase.table('organizations').select('*').eq('stripe_customer_id', customer_id).single().execute()
            if org.data:
                supabase.table('organizations').update({
                    'subscription_status': 'past_due'
                }).eq('id', org.data['id']).execute()
                
                # Record failed payment
                supabase.table('payment_history').insert({
                    'organization_id': org.data['id'],
                    'stripe_invoice_id': invoice['id'],
                    'amount': invoice['amount_due'],
                    'currency': invoice['currency'],
                    'status': 'failed',
                    'description': 'Payment failed'
                }).execute()
        
        return {'status': 'success'}
    
    @staticmethod
    def get_subscription_info(organization_id):
        """Get current subscription information"""
        supabase = get_supabase_admin()
        
        org = supabase.table('organizations').select('*').eq('id', organization_id).single().execute()
        if not org.data:
            raise Exception('Organization not found')
        
        plan_type = org.data.get('plan_type', 'free')
        plan_info = StripeService.PLANS.get(plan_type, StripeService.PLANS['free'])
        
        # Get current usage
        datasets_count = supabase.table('labeling_datasets').select('id', count='exact').eq('organization_id', organization_id).execute()
        talent_count = supabase.table('talent').select('id', count='exact').eq('organization_id', organization_id).execute()
        jobs_count = supabase.table('jobs').select('id', count='exact').eq('organization_id', organization_id).execute()
        
        # Get total rows across all datasets
        datasets = supabase.table('labeling_datasets').select('total_rows').eq('organization_id', organization_id).execute()
        total_rows = sum(d.get('total_rows', 0) for d in datasets.data) if datasets.data else 0
        
        return {
            'plan_type': plan_type,
            'plan_name': plan_info['name'],
            'price': plan_info['price'],
            'features': plan_info['features'],
            'limits': plan_info['limits'],
            'usage': {
                'datasets': datasets_count.count,
                'talent_profiles': talent_count.count,
                'jobs': jobs_count.count,
                'total_rows': total_rows
            },
            'subscription_status': org.data.get('subscription_status', 'inactive'),
            'current_period_end': org.data.get('current_period_end'),
            'has_payment_method': bool(org.data.get('stripe_customer_id'))
        }
    
    @staticmethod
    def check_limit(organization_id, resource_type):
        """Check if organization can create more of a resource type"""
        supabase = get_supabase_admin()
        
        # Get organization plan
        org = supabase.table('organizations').select('*').eq('id', organization_id).single().execute()
        if not org.data:
            raise Exception('Organization not found')
        
        plan_type = org.data.get('plan_type', 'free')
        limits = StripeService.PLANS[plan_type]['limits']
        
        # Get current usage based on resource type
        if resource_type == 'datasets':
            count = supabase.table('labeling_datasets').select('id', count='exact').eq('organization_id', organization_id).execute()
            current = count.count
            limit = limits['datasets']
            
        elif resource_type == 'talent':
            count = supabase.table('talent').select('id', count='exact').eq('organization_id', organization_id).execute()
            current = count.count
            limit = limits['talent_profiles']
            
        elif resource_type == 'jobs':
            count = supabase.table('jobs').select('id', count='exact').eq('organization_id', organization_id).execute()
            current = count.count
            limit = limits['jobs']
            
        elif resource_type == 'total_rows':
            # Sum all rows across datasets
            datasets = supabase.table('labeling_datasets').select('total_rows').eq('organization_id', organization_id).execute()
            current = sum(d.get('total_rows', 0) for d in datasets.data) if datasets.data else 0
            limit = limits['total_rows']
            
        elif resource_type == 'export':
            return {
                'allowed': limits['can_export'],
                'limit': 1 if limits['can_export'] else 0,
                'current': 0,
                'remaining': 1 if limits['can_export'] else 0
            }
            
        elif resource_type == 'api_access':
            return {
                'allowed': limits['api_access'],
                'limit': limits['api_rate_limit'],
                'current': 0,  # TODO: Track actual API usage
                'remaining': limits['api_rate_limit']
            }
        else:
            raise Exception(f'Unknown resource type: {resource_type}')
        
        # -1 means unlimited
        if limit == -1:
            return {
                'allowed': True,
                'limit': -1,
                'current': current,
                'remaining': -1
            }
        
        return {
            'allowed': current < limit,
            'limit': limit,
            'current': current,
            'remaining': max(0, limit - current)
        }
