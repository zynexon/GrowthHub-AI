"""
Campaign ROI Calculator - MVP
Simple first-touch attribution
"""
from typing import Dict, List
from decimal import Decimal


def calculate_campaign_roi(
    spend: Decimal,
    revenue: Decimal
) -> Decimal:
    """
    Calculate ROI: (Revenue - Spend) / Spend
    Returns as percentage (e.g., 1.5 = 150% ROI)
    """
    if spend == 0:
        return Decimal(0)
    
    roi = (revenue - spend) / spend
    return roi


def get_roi_percentage(roi: Decimal) -> str:
    """Convert ROI decimal to percentage string"""
    return f"{(roi * 100):.1f}%"


def get_performance_indicator(roi: Decimal) -> str:
    """
    Get performance indicator based on ROI:
    - Excellent: > 300% (3x return)
    - Good: > 100% (positive ROI)
    - Break-even: 0%
    - Loss: < 0%
    """
    if roi >= 3.0:
        return 'excellent'  # 🚀
    elif roi >= 1.0:
        return 'good'  # ✅
    elif roi >= 0:
        return 'break-even'  # ⚖️
    else:
        return 'loss'  # ⚠️


def aggregate_campaign_metrics(leads: List[Dict]) -> Dict:
    """
    Aggregate metrics for a campaign from its leads
    """
    total_leads = len(leads)
    converted_leads = [l for l in leads if l.get('converted', False)]
    total_conversions = len(converted_leads)
    total_revenue = sum(Decimal(str(l.get('revenue', 0))) for l in converted_leads)
    
    return {
        'lead_count': total_leads,
        'conversion_count': total_conversions,
        'revenue': float(total_revenue),
        'conversion_rate': (total_conversions / total_leads * 100) if total_leads > 0 else 0
    }
