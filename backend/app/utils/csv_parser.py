"""CSV parsing utilities - using csv module instead of pandas."""
import csv
from io import StringIO
from typing import List, Dict
from datetime import datetime


def parse_leads_csv(file) -> List[Dict]:
    """
    Parse leads CSV file.
    Required columns: email, source
    Optional columns: name, company, engagement_level, status
    """
    # Read file content
    content = file.read().decode('utf-8')
    reader = csv.DictReader(StringIO(content))
    
    leads = []
    for row in reader:
        # Validate required columns on first row
        if not leads and ('email' not in row or 'source' not in row):
            raise ValueError('CSV must contain email and source columns')
        
        lead = {
            'email': row.get('email', '').strip(),
            'source': row.get('source', 'website_form').strip(),
            'name': row.get('name', '').strip() or None,
            'company': row.get('company', '').strip() or None,
            'engagement_level': row.get('engagement_level', 'none').strip(),
            'status': row.get('status', 'new').strip(),
        }
        
        # Skip empty rows
        if not lead['email']:
            continue
            
        leads.append(lead)
    
    if not leads:
        raise ValueError('No valid leads found in CSV')
    
    return leads


def parse_campaigns_csv(file) -> List[Dict]:
    """
    Parse campaigns CSV file.
    Required columns: name, spend, start_date, end_date
    Optional columns: channel, revenue, lead_count, conversion_count
    Supports date formats: DD-MM-YYYY, YYYY-MM-DD, MM/DD/YYYY
    """
    # Read file content
    content = file.read().decode('utf-8')
    reader = csv.DictReader(StringIO(content))
    
    def parse_date(date_str: str) -> str:
        """Parse various date formats and return YYYY-MM-DD."""
        if not date_str or not date_str.strip():
            return None
        
        date_str = date_str.strip()
        
        # Try different date formats
        formats = [
            '%d-%m-%Y',  # 31-01-2025
            '%Y-%m-%d',  # 2025-01-31
            '%m/%d/%Y',  # 01/31/2025
            '%d/%m/%Y',  # 31/01/2025
        ]
        
        for fmt in formats:
            try:
                dt = datetime.strptime(date_str, fmt)
                return dt.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        raise ValueError(f'Could not parse date: {date_str}. Use DD-MM-YYYY, YYYY-MM-DD, or MM/DD/YYYY format.')
    
    campaigns = []
    for row in reader:
        # Validate required columns on first row
        if not campaigns:
            required = ['name', 'spend', 'start_date', 'end_date']
            missing = [col for col in required if col not in row]
            if missing:
                raise ValueError(f'CSV must contain columns: {", ".join(missing)}')
        
        try:
            campaign = {
                'name': row.get('name', '').strip(),
                'channel': row.get('channel', '').strip() or None,
                'spend': float(row.get('spend', 0)),
                'start_date': parse_date(row.get('start_date', '')),
                'end_date': parse_date(row.get('end_date', '')),
            }
            
            # Optional metrics - if provided, use them; otherwise default to 0
            if 'revenue' in row and row.get('revenue', '').strip():
                campaign['revenue'] = float(row.get('revenue'))
            
            if 'lead_count' in row and row.get('lead_count', '').strip():
                campaign['lead_count'] = int(row.get('lead_count'))
            
            if 'conversion_count' in row and row.get('conversion_count', '').strip():
                campaign['conversion_count'] = int(row.get('conversion_count'))
            
            # Skip empty rows
            if not campaign['name']:
                continue
                
            campaigns.append(campaign)
        except ValueError as e:
            raise ValueError(f'Error in campaign "{row.get("name")}": {str(e)}')
    
    if not campaigns:
        raise ValueError('No valid campaigns found in CSV')
    
    return campaigns


def parse_customers_csv(file) -> List[Dict]:
    """
    Parse customers CSV without pandas.
    Required: company, email
    Optional: plan, mrr, last_active
    """
    content = file.read().decode('utf-8')
    reader = csv.DictReader(StringIO(content))
    
    customers = []
    for row in reader:
        customer = {
            'company': row.get('company', '').strip(),
            'email': row.get('email', '').strip(),
            'plan': row.get('plan', 'free').strip(),
        }
        
        # Parse MRR
        if 'mrr' in row and row.get('mrr', '').strip():
            try:
                customer['mrr'] = float(row.get('mrr'))
            except ValueError:
                customer['mrr'] = 0
        else:
            customer['mrr'] = 0
        
        # Parse last_active date
        if 'last_active' in row and row.get('last_active', '').strip():
            # Try to parse date
            try:
                from datetime import datetime
                date_str = row.get('last_active').strip()
                # Try different formats
                for fmt in ['%Y-%m-%d', '%d-%m-%Y', '%m/%d/%Y']:
                    try:
                        dt = datetime.strptime(date_str, fmt)
                        customer['last_active'] = dt.isoformat()
                        break
                    except ValueError:
                        continue
            except:
                pass  # Will use default in service
        
        # Add metadata if provided
        metadata = {}
        if 'open_issues' in row and row.get('open_issues', '').strip():
            try:
                metadata['open_issues'] = int(row.get('open_issues'))
            except ValueError:
                pass
        
        if 'usage_tier' in row and row.get('usage_tier', '').strip():
            metadata['usage_tier'] = row.get('usage_tier').strip().lower()
        
        if 'team_count' in row and row.get('team_count', '').strip():
            try:
                metadata['team_count'] = int(row.get('team_count'))
            except ValueError:
                pass
        
        if metadata:
            customer['metadata'] = metadata
        
        if customer['email'] and customer['company']:
            customers.append(customer)
    
    return customers


def parse_labeling_csv(file) -> List[Dict]:
    """
    Parse data labeling CSV file.
    Required columns: id, text
    Format: Simple id,text structure for text classification tasks
    """
    content = file.read().decode('utf-8')
    reader = csv.DictReader(StringIO(content))
    
    rows = []
    for row in reader:
        # Validate required columns on first row
        if not rows and ('id' not in row or 'text' not in row):
            raise ValueError('CSV must contain id and text columns')
        
        data_row = {
            'id': row.get('id', '').strip(),
            'text': row.get('text', '').strip()
        }
        
        # Skip empty rows
        if not data_row['id'] or not data_row['text']:
            continue
        
        rows.append(data_row)
    
    if not rows:
        raise ValueError('No valid rows found in CSV')
    
    return rows
