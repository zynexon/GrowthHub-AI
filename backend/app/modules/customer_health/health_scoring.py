"""Customer health scoring engine."""
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Tuple
from decimal import Decimal


def calculate_health_score(customer: Dict) -> Tuple[int, Dict]:
    """
    Calculate unified customer health score (0-100).
    
    Returns: (score, breakdown_dict)
    """
    breakdown = {
        'engagement': 0,
        'revenue_stability': 0,
        'support_activity': 0,
        'time_decay': 0
    }
    
    # A. Engagement Score (0-40)
    last_active = customer.get('last_active')
    if last_active:
        if isinstance(last_active, str):
            last_active = datetime.fromisoformat(last_active.replace('Z', '+00:00'))
        
        days_inactive = (datetime.now(timezone.utc) - last_active).days
        
        if days_inactive <= 7:
            breakdown['engagement'] = 40
        elif days_inactive <= 14:
            breakdown['engagement'] = 20
        else:
            breakdown['engagement'] = 0
    
    # B. Revenue Stability (0-30)
    mrr = customer.get('mrr', 0)
    previous_mrr = customer.get('previous_mrr', mrr)  # Would come from historical data
    
    if mrr > previous_mrr:
        breakdown['revenue_stability'] = 30  # Growing
    elif mrr == previous_mrr and mrr > 0:
        breakdown['revenue_stability'] = 20  # Stable
    elif mrr < previous_mrr and mrr > 0:
        breakdown['revenue_stability'] = 10  # Declining
    else:
        breakdown['revenue_stability'] = 0  # No revenue
    
    # C. Support / Activity (0-20)
    # For MVP, we'll use metadata to check for issues
    metadata = customer.get('metadata', {})
    open_issues = metadata.get('open_issues', 0)
    
    if open_issues == 0:
        breakdown['support_activity'] = 20
    elif open_issues <= 2:
        breakdown['support_activity'] = 10
    else:
        breakdown['support_activity'] = 0
    
    # D. Time Decay Modifier (-10 to 0)
    if last_active:
        if days_inactive >= 30:
            breakdown['time_decay'] = -10
        elif days_inactive >= 14:
            breakdown['time_decay'] = -5
        else:
            breakdown['time_decay'] = 0
    
    # Calculate total score
    total_score = sum(breakdown.values())
    total_score = max(0, min(100, total_score))  # Clamp between 0-100
    
    return total_score, breakdown


def get_health_status(score: int) -> str:
    """Get health status from score."""
    if score >= 80:
        return 'healthy'
    elif score >= 50:
        return 'watch'
    else:
        return 'at_risk'


def get_health_color(status: str) -> str:
    """Get color for health status."""
    colors = {
        'healthy': 'green',
        'watch': 'yellow',
        'at_risk': 'red'
    }
    return colors.get(status, 'gray')


def predict_churn_risk(customer: Dict, health_score: int) -> Tuple[str, int, List[str]]:
    """
    Predict churn risk window (3/7/14 days).
    
    Returns: (risk_level, days, reasons)
    """
    reasons = []
    risk_days = None
    risk_level = 'low'
    
    last_active = customer.get('last_active')
    if last_active:
        if isinstance(last_active, str):
            last_active = datetime.fromisoformat(last_active.replace('Z', '+00:00'))
        days_inactive = (datetime.now(timezone.utc) - last_active).days
    else:
        days_inactive = 999
    
    mrr = customer.get('mrr', 0)
    previous_mrr = customer.get('previous_mrr', mrr)
    metadata = customer.get('metadata', {})
    open_issues = metadata.get('open_issues', 0)
    
    # 🔴 3-Day Risk (CRITICAL)
    if (days_inactive >= 14 or 
        (mrr < previous_mrr * 0.8) or  # 20% revenue drop
        open_issues > 2):
        
        risk_level = 'critical'
        risk_days = 3
        
        if days_inactive >= 14:
            reasons.append(f'No activity in {days_inactive} days')
        if mrr < previous_mrr * 0.8:
            reasons.append('Significant revenue drop')
        if open_issues > 2:
            reasons.append(f'{open_issues} unresolved issues')
    
    # 🟠 7-Day Risk (HIGH)
    elif (days_inactive >= 7 or 
          health_score < 50 or
          mrr < previous_mrr):
        
        risk_level = 'high'
        risk_days = 7
        
        if days_inactive >= 7:
            reasons.append(f'Low engagement ({days_inactive} days inactive)')
        if mrr < previous_mrr:
            reasons.append('Revenue declining')
        if health_score < 50:
            reasons.append('Low health score')
    
    # 🟡 14-Day Risk (MEDIUM)
    elif (days_inactive >= 3 or 
          mrr == previous_mrr or
          health_score < 70):
        
        risk_level = 'medium'
        risk_days = 14
        
        if days_inactive >= 3:
            reasons.append('Gradual usage decline')
        if mrr == previous_mrr and mrr > 0:
            reasons.append('Revenue flat')
        if health_score < 70:
            reasons.append('Health score declining')
    
    else:
        risk_level = 'low'
        risk_days = None
        reasons.append('Account is healthy')
    
    return risk_level, risk_days, reasons


def detect_expansion_signals(customer: Dict, health_score: int) -> Dict:
    """
    Detect expansion and upsell opportunities.
    
    Returns: {has_opportunity, signal_type, suggestion}
    """
    mrr = customer.get('mrr', 0)
    plan = customer.get('plan', 'free').lower()
    metadata = customer.get('metadata', {})
    
    # High usage indicator (from metadata)
    high_usage = metadata.get('usage_tier', 'low') == 'high'
    multiple_teams = metadata.get('team_count', 1) > 1
    
    # High engagement, low plan = Upgrade (highest priority)
    if health_score >= 75 and plan in ['free', 'starter']:
        return {
            'has_opportunity': True,
            'signal_type': 'upgrade',
            'suggestion': 'High engagement on lower tier - suggest plan upgrade',
            'priority': 'high'
        }
    
    # High engagement + stable revenue = Upsell
    if health_score >= 80 and mrr >= 5000:
        if high_usage:
            return {
                'has_opportunity': True,
                'signal_type': 'upsell',
                'suggestion': 'High usage and stable revenue - consider premium features',
                'priority': 'high'
            }
        else:
            # Even without usage_tier metadata, high score + high MRR = opportunity
            return {
                'has_opportunity': True,
                'signal_type': 'upsell',
                'suggestion': 'Strong account health - consider premium add-ons',
                'priority': 'medium'
            }
    
    # Multiple teams active = Cross-sell
    if multiple_teams and health_score >= 70:
        return {
            'has_opportunity': True,
            'signal_type': 'cross_sell',
            'suggestion': 'Multiple teams active - offer team collaboration tools',
            'priority': 'medium'
        }
    
    return {
        'has_opportunity': False,
        'signal_type': None,
        'suggestion': None,
        'priority': None
    }
