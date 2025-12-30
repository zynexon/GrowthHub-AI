"""RevOps service for lead scoring and ROI attribution."""
from app.extensions import get_supabase, get_supabase_admin
from app.modules.revops.scoring import calculate_lead_score, get_score_breakdown
from app.modules.revops.roi_calculator import calculate_campaign_roi, get_roi_percentage, get_performance_indicator, aggregate_campaign_metrics
from app.utils.csv_parser import parse_leads_csv, parse_campaigns_csv
from datetime import datetime, timezone
from decimal import Decimal


class RevOpsService:
    """Handle RevOps operations."""
    
    def __init__(self):
        self.supabase = get_supabase()
        self.admin = get_supabase_admin()
    
    def get_leads(self, org_id: str, sort_by: str = 'score'):
        """Get all leads for organization, sorted by score by default."""
        query = self.admin.table('leads')\
            .select('*')\
            .eq('organization_id', org_id)
        
        # Sort by score (descending) or created_at
        if sort_by == 'score':
            query = query.order('score', desc=True)
        else:
            query = query.order('created_at', desc=True)
        
        response = query.execute()
        
        return {'leads': response.data}
    
    def create_lead(self, org_id: str, data: dict):
        """Create a new lead with automatic scoring."""
        lead_data = {
            'organization_id': org_id,
            'name': data.get('name'),
            'email': data.get('email'),
            'company': data.get('company'),
            'source': data.get('source', 'website_form'),
            'campaign_id': data.get('campaign_id'),
            'status': 'new',
            'engagement_level': data.get('engagement_level', 'none'),
            'last_activity_date': datetime.now(timezone.utc).isoformat()
        }
        
        # Calculate score
        score, temperature = calculate_lead_score(
            lead_data['source'],
            lead_data['engagement_level'],
            datetime.now(timezone.utc),
            lead_data['status']
        )
        
        lead_data['score'] = score
        lead_data['temperature'] = temperature
        
        response = self.admin.table('leads')\
            .insert(lead_data)\
            .execute()
        
        return {'lead': response.data[0]}
    
    def upload_leads_csv(self, org_id: str, file):
        """Upload and parse CSV file with leads, skipping duplicates."""
        leads = parse_leads_csv(file)
        
        # Get existing emails for this organization to check for duplicates
        existing_response = self.admin.table('leads')\
            .select('email')\
            .eq('organization_id', org_id)\
            .execute()
        
        existing_emails = {lead['email'].lower() for lead in existing_response.data if lead.get('email')}
        
        # Filter out duplicates and process new leads
        new_leads = []
        duplicates = 0
        
        for lead in leads:
            # Skip if email already exists
            if lead.get('email') and lead['email'].lower() in existing_emails:
                duplicates += 1
                continue
            
            lead['organization_id'] = org_id
            lead['status'] = lead.get('status', 'new')
            lead['engagement_level'] = lead.get('engagement_level', 'none')
            
            # Set last_activity_date
            if 'last_activity_date' not in lead or not lead['last_activity_date']:
                lead['last_activity_date'] = datetime.now(timezone.utc).isoformat()
            
            # Calculate score
            activity_date = datetime.fromisoformat(lead['last_activity_date'].replace('Z', '+00:00'))
            score, temperature = calculate_lead_score(
                lead.get('source', 'website_form'),
                lead['engagement_level'],
                activity_date,
                lead['status']
            )
            
            lead['score'] = score
            lead['temperature'] = temperature
            new_leads.append(lead)
        
        # Bulk insert only new leads
        if new_leads:
            response = self.admin.table('leads')\
                .insert(new_leads)\
                .execute()
        
        return {
            'message': f'{len(new_leads)} new leads uploaded successfully, {duplicates} duplicates skipped',
            'uploaded': len(new_leads),
            'duplicates': duplicates,
            'total': len(leads)
        }
    
    def update_lead(self, org_id: str, lead_id: str, data: dict):
        """Update lead and recalculate score."""
        # Get current lead
        current = self.admin.table('leads')\
            .select('*')\
            .eq('organization_id', org_id)\
            .eq('id', lead_id)\
            .single()\
            .execute()
        
        lead = current.data
        
        # Update fields
        if 'status' in data:
            lead['status'] = data['status']
        if 'engagement_level' in data:
            lead['engagement_level'] = data['engagement_level']
        if 'source' in data:
            lead['source'] = data['source']
        if 'converted' in data:
            lead['converted'] = data['converted']
            if data['converted']:
                lead['conversion_date'] = datetime.now(timezone.utc).isoformat()
        if 'revenue' in data:
            lead['revenue'] = data['revenue']
        
        # Update last_activity_date
        lead['last_activity_date'] = datetime.now(timezone.utc).isoformat()
        
        # Recalculate score
        activity_date = datetime.fromisoformat(lead['last_activity_date'].replace('Z', '+00:00'))
        score, temperature = calculate_lead_score(
            lead['source'],
            lead['engagement_level'],
            activity_date,
            lead['status']
        )
        
        lead['score'] = score
        lead['temperature'] = temperature
        lead['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        # Update in database
        response = self.admin.table('leads')\
            .update(lead)\
            .eq('id', lead_id)\
            .execute()
        
        # Update campaign stats if lead converted
        if lead.get('converted') and lead.get('campaign_id'):
            self._update_campaign_stats(lead['campaign_id'])
        
        return {'lead': response.data[0]}
    
    def get_lead(self, org_id: str, lead_id: str):
        """Get single lead with score breakdown."""
        response = self.admin.table('leads')\
            .select('*')\
            .eq('organization_id', org_id)\
            .eq('id', lead_id)\
            .single()\
            .execute()
        
        lead = response.data
        
        # Get score breakdown
        if lead.get('last_activity_date'):
            activity_date = datetime.fromisoformat(lead['last_activity_date'].replace('Z', '+00:00'))
            breakdown = get_score_breakdown(
                lead['source'],
                lead['engagement_level'],
                activity_date,
                lead['status']
            )
            lead['score_breakdown'] = breakdown
        
        return {'lead': lead}
    
    # Campaign Management
    
    def get_campaigns(self, org_id: str):
        """Get all campaigns with ROI metrics."""
        response = self.admin.table('campaigns')\
            .select('*')\
            .eq('organization_id', org_id)\
            .order('roi', desc=True)\
            .execute()
        
        campaigns = response.data
        
        # Add performance indicators
        for campaign in campaigns:
            roi = Decimal(str(campaign.get('roi', 0)))
            campaign['roi_percentage'] = get_roi_percentage(roi)
            campaign['performance'] = get_performance_indicator(roi)
        
        return {'campaigns': campaigns}
    
    def create_campaign(self, org_id: str, data: dict):
        """Create a new campaign."""
        campaign_data = {
            'organization_id': org_id,
            'name': data.get('name'),
            'channel': data.get('channel'),
            'spend': data.get('spend', 0),
            'period': data.get('period'),
            'lead_count': 0,
            'conversion_count': 0,
            'revenue': 0,
            'roi': 0
        }
        
        response = self.admin.table('campaigns')\
            .insert(campaign_data)\
            .execute()
        
        return {'campaign': response.data[0]}
    
    def upload_campaigns_csv(self, org_id: str, file):
        """Upload campaigns with spend and optional revenue data, skipping duplicates."""
        campaigns = parse_campaigns_csv(file)
        
        # Get existing campaign names for this organization to check for duplicates
        existing_response = self.admin.table('campaigns')\
            .select('name')\
            .eq('organization_id', org_id)\
            .execute()
        
        existing_names = {campaign['name'].lower() for campaign in existing_response.data if campaign.get('name')}
        
        # Filter out duplicates and process new campaigns
        new_campaigns = []
        duplicates = 0
        
        for campaign in campaigns:
            # Skip if campaign name already exists
            if campaign.get('name') and campaign['name'].lower() in existing_names:
                duplicates += 1
                continue
            
            campaign['organization_id'] = org_id
            
            # Set defaults for optional fields if not provided
            if 'lead_count' not in campaign:
                campaign['lead_count'] = 0
            if 'conversion_count' not in campaign:
                campaign['conversion_count'] = 0
            if 'revenue' not in campaign:
                campaign['revenue'] = 0
            
            # Calculate ROI if revenue is provided
            spend = Decimal(str(campaign.get('spend', 0)))
            revenue = Decimal(str(campaign.get('revenue', 0)))
            
            if spend > 0:
                roi = calculate_campaign_roi(spend, revenue)
                campaign['roi'] = float(roi)
            else:
                campaign['roi'] = 0
            
            new_campaigns.append(campaign)
        
        # Bulk insert only new campaigns
        if new_campaigns:
            response = self.admin.table('campaigns')\
                .insert(new_campaigns)\
                .execute()
        
        return {
            'message': f'{len(new_campaigns)} campaigns uploaded successfully, {duplicates} duplicates skipped',
            'uploaded': len(new_campaigns),
            'duplicates': duplicates,
            'total': len(campaigns)
        }
    
    def _update_campaign_stats(self, campaign_id: str):
        """Update campaign statistics based on its leads."""
        # Get all leads for this campaign
        leads_response = self.admin.table('leads')\
            .select('*')\
            .eq('campaign_id', campaign_id)\
            .execute()
        
        leads = leads_response.data
        metrics = aggregate_campaign_metrics(leads)
        
        # Get campaign to calculate ROI
        campaign_response = self.admin.table('campaigns')\
            .select('*')\
            .eq('id', campaign_id)\
            .single()\
            .execute()
        
        campaign = campaign_response.data
        spend = Decimal(str(campaign.get('spend', 0)))
        revenue = Decimal(str(metrics['revenue']))
        
        roi = calculate_campaign_roi(spend, revenue)
        
        # Update campaign
        update_data = {
            'lead_count': metrics['lead_count'],
            'conversion_count': metrics['conversion_count'],
            'revenue': float(revenue),
            'roi': float(roi),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        self.admin.table('campaigns')\
            .update(update_data)\
            .eq('id', campaign_id)\
            .execute()
    
    def get_dashboard_stats(self, org_id: str):
        """Get RevOps dashboard statistics."""
        # Get all leads
        leads_response = self.admin.table('leads')\
            .select('*')\
            .eq('organization_id', org_id)\
            .execute()
        
        leads = leads_response.data
        
        # Calculate stats
        total_leads = len(leads)
        hot_leads = len([l for l in leads if l.get('temperature') == 'hot'])
        warm_leads = len([l for l in leads if l.get('temperature') == 'warm'])
        cold_leads = len([l for l in leads if l.get('temperature') == 'cold'])
        
        # Leads needing follow-up (hot leads not yet contacted)
        follow_up_leads = len([
            l for l in leads 
            if l.get('temperature') == 'hot' and l.get('status') in ['new', 'contacted']
        ])
        
        # Get top campaigns by ROI
        campaigns_response = self.admin.table('campaigns')\
            .select('*')\
            .eq('organization_id', org_id)\
            .order('roi', desc=True)\
            .limit(5)\
            .execute()
        
        top_campaigns = campaigns_response.data
        
        return {
            'total_leads': total_leads,
            'hot_leads': hot_leads,
            'warm_leads': warm_leads,
            'cold_leads': cold_leads,
            'follow_up_count': follow_up_leads,
            'top_campaigns': top_campaigns
        }


revops_service = RevOpsService()
