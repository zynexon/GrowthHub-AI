"""Customer Health service."""
from app.extensions import get_supabase_admin
from app.modules.customer_health.health_scoring import (
    calculate_health_score,
    get_health_status,
    get_health_color,
    predict_churn_risk,
    detect_expansion_signals
)
from datetime import datetime, timezone
from typing import Dict, List


class CustomerHealthService:
    """Handle customer health operations."""
    
    def __init__(self):
        self.admin = get_supabase_admin()
    
    def get_customers(self, org_id: str, filter_by: str = None) -> Dict:
        """Get all customers with health scores."""
        query = self.admin.table('customers')\
            .select('*')\
            .eq('organization_id', org_id)
        
        response = query.execute()
        customers = response.data
        
        # Calculate health for each customer
        enriched_customers = []
        for customer in customers:
            # Calculate health score
            score, breakdown = calculate_health_score(customer)
            status = get_health_status(score)
            
            # Predict churn risk
            risk_level, risk_days, risk_reasons = predict_churn_risk(customer, score)
            
            # Detect expansion signals
            expansion = detect_expansion_signals(customer, score)
            
            enriched_customers.append({
                **customer,
                'health_score': score,
                'health_status': status,
                'health_breakdown': breakdown,
                'churn_risk': {
                    'level': risk_level,
                    'days': risk_days,
                    'reasons': risk_reasons
                },
                'expansion_signal': expansion
            })
        
        # Apply filters
        if filter_by == 'at_risk':
            enriched_customers = [c for c in enriched_customers if c['health_status'] == 'at_risk']
        elif filter_by == 'expansion':
            enriched_customers = [c for c in enriched_customers if c['expansion_signal']['has_opportunity']]
        elif filter_by == 'healthy':
            enriched_customers = [c for c in enriched_customers if c['health_status'] == 'healthy']
        
        # Sort by health score (lowest first for at-risk)
        enriched_customers.sort(key=lambda x: x['health_score'])
        
        return {'customers': enriched_customers}
    
    def get_customer(self, org_id: str, customer_id: str) -> Dict:
        """Get single customer with detailed health analysis."""
        response = self.admin.table('customers')\
            .select('*')\
            .eq('organization_id', org_id)\
            .eq('id', customer_id)\
            .single()\
            .execute()
        
        customer = response.data
        
        # Calculate health metrics
        score, breakdown = calculate_health_score(customer)
        status = get_health_status(score)
        risk_level, risk_days, risk_reasons = predict_churn_risk(customer, score)
        expansion = detect_expansion_signals(customer, score)
        
        return {
            'customer': {
                **customer,
                'health_score': score,
                'health_status': status,
                'health_breakdown': breakdown,
                'churn_risk': {
                    'level': risk_level,
                    'days': risk_days,
                    'reasons': risk_reasons
                },
                'expansion_signal': expansion
            }
        }
    
    def create_customer(self, org_id: str, data: Dict) -> Dict:
        """Create a new customer."""
        customer_data = {
            'organization_id': org_id,
            'company': data.get('company'),
            'email': data.get('email'),
            'plan': data.get('plan', 'free'),
            'mrr': float(data.get('mrr', 0)),
            'last_active': data.get('last_active') or datetime.now(timezone.utc).isoformat(),
            'metadata': data.get('metadata', {})
        }
        
        response = self.admin.table('customers')\
            .insert(customer_data)\
            .execute()
        
        return {'customer': response.data[0]}
    
    def upload_customers_csv(self, org_id: str, file) -> Dict:
        """Upload customers from CSV."""
        from app.utils.csv_parser import parse_customers_csv
        
        customers = parse_customers_csv(file)
        
        # Get existing emails to check for duplicates
        existing_response = self.admin.table('customers')\
            .select('email')\
            .eq('organization_id', org_id)\
            .execute()
        
        existing_emails = {c['email'].lower() for c in existing_response.data if c.get('email')}
        
        # Filter out duplicates
        new_customers = []
        duplicates = 0
        
        for customer in customers:
            if customer.get('email') and customer['email'].lower() in existing_emails:
                duplicates += 1
                continue
            
            customer['organization_id'] = org_id
            customer['last_active'] = customer.get('last_active') or datetime.now(timezone.utc).isoformat()
            new_customers.append(customer)
        
        # Bulk insert
        if new_customers:
            self.admin.table('customers')\
                .insert(new_customers)\
                .execute()
        
        return {
            'message': f'{len(new_customers)} customers uploaded, {duplicates} duplicates skipped',
            'uploaded': len(new_customers),
            'duplicates': duplicates
        }
    
    def get_dashboard_stats(self, org_id: str) -> Dict:
        """Get customer health dashboard statistics."""
        customers_data = self.get_customers(org_id)
        customers = customers_data['customers']
        
        total_customers = len(customers)
        healthy = len([c for c in customers if c['health_status'] == 'healthy'])
        watch = len([c for c in customers if c['health_status'] == 'watch'])
        at_risk = len([c for c in customers if c['health_status'] == 'at_risk'])
        
        # Churn risk breakdown
        critical_risk = len([c for c in customers if c['churn_risk']['level'] == 'critical'])
        high_risk = len([c for c in customers if c['churn_risk']['level'] == 'high'])
        medium_risk = len([c for c in customers if c['churn_risk']['level'] == 'medium'])
        
        # Expansion opportunities
        expansion_opportunities = len([c for c in customers if c['expansion_signal']['has_opportunity']])
        
        # Average health score
        avg_health = sum(c['health_score'] for c in customers) / total_customers if total_customers > 0 else 0
        
        # At-risk alerts (customers needing immediate attention)
        alerts = [
            {
                'customer_id': c['id'],
                'company': c['company'],
                'health_score': c['health_score'],
                'risk_days': c['churn_risk']['days'],
                'reasons': c['churn_risk']['reasons']
            }
            for c in customers
            if c['churn_risk']['level'] in ['critical', 'high']
        ]
        
        return {
            'total_customers': total_customers,
            'healthy': healthy,
            'watch': watch,
            'at_risk': at_risk,
            'avg_health_score': round(avg_health, 1),
            'churn_risk': {
                'critical': critical_risk,
                'high': high_risk,
                'medium': medium_risk
            },
            'expansion_opportunities': expansion_opportunities,
            'alerts': alerts[:10]  # Top 10 most urgent
        }


customer_health_service = CustomerHealthService()
