"""
Lead Scoring Engine - MVP
Simple, deterministic scoring based on Source + Engagement + Recency + Status
"""
from datetime import datetime, timezone
from typing import Dict, Tuple


def calculate_lead_score(
    source: str,
    engagement_level: str,
    last_activity_date: datetime,
    status: str
) -> Tuple[int, str]:
    """
    Calculate lead score (0-100) based on:
    - Source Score
    - Engagement Score  
    - Recency Score
    - Status Modifier
    
    Returns: (score, temperature)
    """
    score = 0
    
    # Source Score
    source_scores = {
        'website_form': 20,
        'inbound_referral': 25,
        'paid_ads': 15,
        'cold_list': 5
    }
    score += source_scores.get(source, 0)
    
    # Engagement Score
    engagement_scores = {
        'form_filled': 20,
        'email_replied': 25,
        'multiple_visits': 15,
        'none': 0
    }
    score += engagement_scores.get(engagement_level, 0)
    
    # Recency Score
    if last_activity_date:
        now = datetime.now(timezone.utc)
        days_since = (now - last_activity_date).days
        
        if days_since < 1:
            score += 20
        elif days_since <= 3:
            score += 15
        elif days_since <= 7:
            score += 10
        # > 7 days: +0
    
    # Status Modifier
    status_modifiers = {
        'contacted': -5,
        'qualified': 10,
        'lost': -30,
        'new': 0,
        'converted': 0
    }
    score += status_modifiers.get(status, 0)
    
    # Ensure score is within 0-100
    score = max(0, min(100, score))
    
    # Determine temperature
    if score >= 80:
        temperature = 'hot'  # 🔥
    elif score >= 50:
        temperature = 'warm'  # 🟡
    else:
        temperature = 'cold'  # 🔵
    
    return score, temperature


def get_score_breakdown(
    source: str,
    engagement_level: str,
    last_activity_date: datetime,
    status: str
) -> Dict:
    """
    Get detailed breakdown of how the score was calculated
    """
    breakdown = {}
    
    # Source Score
    source_scores = {
        'website_form': 20,
        'inbound_referral': 25,
        'paid_ads': 15,
        'cold_list': 5
    }
    breakdown['source'] = {
        'value': source,
        'score': source_scores.get(source, 0)
    }
    
    # Engagement Score
    engagement_scores = {
        'form_filled': 20,
        'email_replied': 25,
        'multiple_visits': 15,
        'none': 0
    }
    breakdown['engagement'] = {
        'value': engagement_level,
        'score': engagement_scores.get(engagement_level, 0)
    }
    
    # Recency Score
    if last_activity_date:
        now = datetime.now(timezone.utc)
        days_since = (now - last_activity_date).days
        
        if days_since < 1:
            recency_score = 20
            recency_label = '< 1 day'
        elif days_since <= 3:
            recency_score = 15
            recency_label = '1-3 days'
        elif days_since <= 7:
            recency_score = 10
            recency_label = '3-7 days'
        else:
            recency_score = 0
            recency_label = '> 7 days'
        
        breakdown['recency'] = {
            'days_since': days_since,
            'label': recency_label,
            'score': recency_score
        }
    else:
        breakdown['recency'] = {
            'days_since': None,
            'label': 'No activity',
            'score': 0
        }
    
    # Status Modifier
    status_modifiers = {
        'contacted': -5,
        'qualified': 10,
        'lost': -30,
        'new': 0,
        'converted': 0
    }
    breakdown['status'] = {
        'value': status,
        'modifier': status_modifiers.get(status, 0)
    }
    
    # Total
    total = (
        breakdown['source']['score'] +
        breakdown['engagement']['score'] +
        breakdown['recency']['score'] +
        breakdown['status']['modifier']
    )
    breakdown['total'] = max(0, min(100, total))
    
    return breakdown
