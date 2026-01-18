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
    
    def clear_customers(self, org_id: str) -> Dict:
        """Delete all customers for the organization."""
        response = self.admin.table('customers')\
            .delete()\
            .eq('organization_id', org_id)\
            .execute()
        
        deleted_count = len(response.data) if response.data else 0
        return {
            'message': f'Deleted {deleted_count} customers',
            'deleted': deleted_count
        }
    
    def analyze_customers_with_ai(self, org_id: str) -> Dict:
        """Analyze customer health data and provide AI-powered insights."""
        from app.ai.gemini_client import get_gemini_client
        
        # Get all customers with health scores
        query = self.admin.table('customers')\
            .select('*')\
            .eq('organization_id', org_id)
        
        response = query.execute()
        customers = response.data
        total_customers = len(customers)
        
        if total_customers == 0:
            return {
                'total_customers': 0,
                'health_distribution': {'healthy': 0, 'watch': 0, 'at_risk': 0},
                'insights': ['No customer data available yet'],
                'recommendations': ['Upload customer data to get AI-powered insights']
            }
        
        # Calculate health distribution and metrics
        health_distribution = {'healthy': 0, 'watch': 0, 'at_risk': 0}
        churn_risk_distribution = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
        total_mrr = 0
        expansion_candidates = 0
        
        for customer in customers:
            # Calculate health score
            score, breakdown = calculate_health_score(customer)
            status = get_health_status(score)
            health_distribution[status] = health_distribution.get(status, 0) + 1
            
            # Churn risk
            risk_level, risk_days, risk_reasons = predict_churn_risk(customer, score)
            if risk_level:
                churn_risk_distribution[risk_level] = churn_risk_distribution.get(risk_level, 0) + 1
            
            # MRR
            mrr = customer.get('mrr', 0)
            if mrr:
                total_mrr += mrr
            
            # Expansion signals
            expansion = detect_expansion_signals(customer, score)
            if expansion.get('signals'):
                expansion_candidates += 1
        
        avg_mrr = total_mrr / total_customers if total_customers > 0 else 0
        at_risk_percent = (health_distribution['at_risk'] / total_customers * 100) if total_customers > 0 else 0
        
        # Create AI prompt
        prompt = f"""Analyze this customer health portfolio data:

Total Customers: {total_customers}
Total MRR: ${total_mrr:,.2f}
Average MRR per Customer: ${avg_mrr:.2f}

Health Status Distribution:
- Healthy: {health_distribution['healthy']} customers ({health_distribution['healthy']/total_customers*100:.1f}%)
- Watch: {health_distribution['watch']} customers ({health_distribution['watch']/total_customers*100:.1f}%)
- At Risk: {health_distribution['at_risk']} customers ({health_distribution['at_risk']/total_customers*100:.1f}%)

Churn Risk:
- Critical: {churn_risk_distribution['critical']} customers
- High: {churn_risk_distribution['high']} customers
- Medium: {churn_risk_distribution['medium']} customers

Expansion Opportunities: {expansion_candidates} customers showing positive signals

Provide:
1. 3-4 key insights about customer health trends and risks
2. 3-4 actionable recommendations to reduce churn and drive expansion

Format your response as JSON with two arrays: "insights" and "recommendations".
Each should be a concise sentence (max 100 characters).
"""
        
        try:
            gemini = get_gemini_client()
            ai_response = gemini.generate_text(prompt)
            
            import json
            import re
            
            json_match = re.search(r'\{[\s\S]*\}', ai_response)
            if json_match:
                ai_data = json.loads(json_match.group())
                insights = ai_data.get('insights', [])
                recommendations = ai_data.get('recommendations', [])
            else:
                lines = [line.strip() for line in ai_response.split('\n') if line.strip()]
                insights = lines[:4]
                recommendations = lines[4:8] if len(lines) > 4 else []
        
        except Exception as e:
            print(f"AI analysis error: {e}")
            # Fallback to rule-based insights
            insights = [
                f"{at_risk_percent:.1f}% of customers at risk - immediate attention needed",
                f"Portfolio MRR at ${total_mrr:,.0f} with ${avg_mrr:.0f} average per customer",
                f"{expansion_candidates} customers ready for upsell conversations"
            ]
            recommendations = [
                f"Prioritize {health_distribution['at_risk']} at-risk customers with retention campaigns",
                f"Engage {expansion_candidates} expansion candidates with upgrade offers",
                "Implement proactive outreach for watch-list customers"
            ]
        
        return {
            'total_customers': total_customers,
            'total_mrr': float(total_mrr),
            'avg_mrr': float(avg_mrr),
            'health_distribution': health_distribution,
            'churn_risk_distribution': churn_risk_distribution,
            'expansion_candidates': expansion_candidates,
            'insights': insights[:4],
            'recommendations': recommendations[:4]
        }


customer_health_service = CustomerHealthService()
