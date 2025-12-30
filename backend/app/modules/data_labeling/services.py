"""Data labeling service for dataset management and labeling."""
from app.extensions import get_supabase_admin
from app.utils.csv_parser import parse_labeling_csv
from datetime import datetime, timezone
import csv
from io import StringIO


class DataLabelingService:
    """Handle data labeling operations."""
    
    def __init__(self):
        self.admin = get_supabase_admin()
    
    def get_datasets(self, org_id: str):
        """Get all datasets for organization."""
        response = self.admin.table('labeling_datasets')\
            .select('*')\
            .eq('organization_id', org_id)\
            .order('created_at', desc=True)\
            .execute()
        
        datasets = []
        for dataset in response.data:
            # Get labeling stats
            stats = self._get_dataset_stats(dataset['id'])
            datasets.append({
                **dataset,
                **stats
            })
        
        return {'datasets': datasets}
    
    def get_dataset(self, org_id: str, dataset_id: str):
        """Get single dataset with full details."""
        response = self.admin.table('labeling_datasets')\
            .select('*')\
            .eq('organization_id', org_id)\
            .eq('id', dataset_id)\
            .single()\
            .execute()
        
        dataset = response.data
        stats = self._get_dataset_stats(dataset_id)
        
        return {
            'dataset': {
                **dataset,
                **stats
            }
        }
    
    def create_dataset(self, org_id: str, name: str, label_type: str, file):
        """Create dataset from CSV upload."""
        # Parse CSV
        rows = parse_labeling_csv(file)
        
        # Create dataset
        dataset_data = {
            'organization_id': org_id,
            'name': name,
            'label_type': label_type,
            'total_rows': len(rows),
            'status': 'not_started'
        }
        
        dataset_response = self.admin.table('labeling_datasets')\
            .insert(dataset_data)\
            .execute()
        
        dataset = dataset_response.data[0]
        
        # Insert all rows
        labeling_rows = []
        for row in rows:
            labeling_rows.append({
                'dataset_id': dataset['id'],
                'row_id': row['id'],
                'text': row['text'],
                'label': None,
                'skipped': False
            })
        
        self.admin.table('labeling_data')\
            .insert(labeling_rows)\
            .execute()
        
        return {
            'dataset': dataset,
            'message': f'Dataset "{name}" created with {len(rows)} rows'
        }
    
    def get_next_unlabeled_row(self, dataset_id: str):
        """Get next row that needs labeling."""
        response = self.admin.table('labeling_data')\
            .select('*')\
            .eq('dataset_id', dataset_id)\
            .is_('label', 'null')\
            .eq('skipped', False)\
            .order('row_id')\
            .limit(1)\
            .execute()
        
        if response.data:
            return {'row': response.data[0]}
        
        return {'row': None, 'message': 'All rows labeled or skipped'}
    
    def label_row(self, dataset_id: str, row_id: str, label: str):
        """Label a row and update dataset status."""
        # Update the row
        response = self.admin.table('labeling_data')\
            .update({'label': label, 'skipped': False})\
            .eq('dataset_id', dataset_id)\
            .eq('id', row_id)\
            .execute()
        
        # Update dataset status
        self._update_dataset_status(dataset_id)
        
        return {'row': response.data[0], 'message': 'Row labeled successfully'}
    
    def skip_row(self, dataset_id: str, row_id: str):
        """Skip a row."""
        response = self.admin.table('labeling_data')\
            .update({'skipped': True})\
            .eq('dataset_id', dataset_id)\
            .eq('id', row_id)\
            .execute()
        
        return {'row': response.data[0], 'message': 'Row skipped'}
    
    def export_dataset(self, org_id: str, dataset_id: str):
        """Export labeled data as CSV."""
        # Verify ownership
        dataset_response = self.admin.table('labeling_datasets')\
            .select('*')\
            .eq('organization_id', org_id)\
            .eq('id', dataset_id)\
            .single()\
            .execute()
        
        # Get all labeled rows (where label is not null)
        rows_response = self.admin.table('labeling_data')\
            .select('*')\
            .eq('dataset_id', dataset_id)\
            .not_.is_('label', 'null')\
            .order('row_id')\
            .execute()
        
        # Generate CSV
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['id', 'text', 'label'])
        
        for row in rows_response.data:
            writer.writerow([row['row_id'], row['text'], row['label']])
        
        csv_content = output.getvalue()
        
        return {
            'csv': csv_content,
            'filename': f"{dataset_response.data['name']}_labeled.csv"
        }
    
    def mark_dataset_completed(self, org_id: str, dataset_id: str):
        """Mark dataset as completed."""
        response = self.admin.table('labeling_datasets')\
            .update({'status': 'completed'})\
            .eq('organization_id', org_id)\
            .eq('id', dataset_id)\
            .execute()
        
        return {'dataset': response.data[0], 'message': 'Dataset marked as completed'}
    
    def _get_dataset_stats(self, dataset_id: str):
        """Get labeling statistics for a dataset."""
        # Get all rows
        all_rows = self.admin.table('labeling_data')\
            .select('label, skipped')\
            .eq('dataset_id', dataset_id)\
            .execute()
        
        total = len(all_rows.data)
        labeled = sum(1 for row in all_rows.data if row['label'] is not None)
        skipped = sum(1 for row in all_rows.data if row['skipped'])
        
        return {
            'labeled_count': labeled,
            'skipped_count': skipped,
            'remaining_count': total - labeled - skipped
        }
    
    def _update_dataset_status(self, dataset_id: str):
        """Update dataset status based on progress."""
        stats = self._get_dataset_stats(dataset_id)
        
        # Get total rows
        dataset = self.admin.table('labeling_datasets')\
            .select('total_rows')\
            .eq('id', dataset_id)\
            .single()\
            .execute()
        
        total = dataset.data['total_rows']
        labeled = stats['labeled_count']
        
        # Determine status
        if labeled == 0:
            status = 'not_started'
        elif labeled == total:
            status = 'completed'
        else:
            status = 'in_progress'
        
        # Update status
        self.admin.table('labeling_datasets')\
            .update({'status': status})\
            .eq('id', dataset_id)\
            .execute()
