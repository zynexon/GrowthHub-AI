from app.extensions import get_supabase_admin

class TalentService:
    @staticmethod
    def get_all_talent(organization_id):
        """Get all talent for an organization"""
        supabase = get_supabase_admin()
        
        response = supabase.table('talent') \
            .select('*') \
            .eq('organization_id', organization_id) \
            .order('created_at', desc=True) \
            .execute()
        
        talent_list = response.data
        
        # Calculate completion rate for each talent
        for talent in talent_list:
            if talent['tasks_assigned'] > 0:
                talent['completion_rate'] = round((talent['tasks_completed'] / talent['tasks_assigned']) * 100, 1)
            else:
                talent['completion_rate'] = 0
        
        return talent_list
    
    @staticmethod
    def get_talent(organization_id, talent_id):
        """Get single talent by ID"""
        supabase = get_supabase_admin()
        
        response = supabase.table('talent') \
            .select('*') \
            .eq('id', talent_id) \
            .eq('organization_id', organization_id) \
            .single() \
            .execute()
        
        talent = response.data
        
        # Calculate completion rate
        if talent['tasks_assigned'] > 0:
            talent['completion_rate'] = round((talent['tasks_completed'] / talent['tasks_assigned']) * 100, 1)
        else:
            talent['completion_rate'] = 0
        
        return talent
    
    @staticmethod
    def create_talent(organization_id, name, email, skill_type, primary_skill=None, secondary_skill=None, bio=None):
        """Create new talent"""
        supabase = get_supabase_admin()
        
        talent_data = {
            'organization_id': organization_id,
            'name': name,
            'email': email,
            'skill_type': skill_type,
            'primary_skill': primary_skill,
            'secondary_skill': secondary_skill,
            'bio': bio,
            'status': 'active',
            'tasks_assigned': 0,
            'tasks_completed': 0,
            'tasks_pending': 0
        }
        
        response = supabase.table('talent') \
            .insert(talent_data) \
            .execute()
        
        return response.data[0]
    
    @staticmethod
    def update_talent(organization_id, talent_id, name=None, email=None, skill_type=None, primary_skill=None, secondary_skill=None, bio=None):
        """Update talent information"""
        supabase = get_supabase_admin()
        
        update_data = {}
        if name is not None:
            update_data['name'] = name
        if email is not None:
            update_data['email'] = email
        if skill_type is not None:
            update_data['skill_type'] = skill_type
        if primary_skill is not None:
            update_data['primary_skill'] = primary_skill
        if secondary_skill is not None:
            update_data['secondary_skill'] = secondary_skill
        if bio is not None:
            update_data['bio'] = bio
        
        if not update_data:
            return None
        
        response = supabase.table('talent') \
            .update(update_data) \
            .eq('id', talent_id) \
            .eq('organization_id', organization_id) \
            .execute()
        
        return response.data[0] if response.data else None
    
    @staticmethod
    def toggle_status(organization_id, talent_id):
        """Toggle talent status between active and inactive"""
        supabase = get_supabase_admin()
        
        # Get current status
        current = supabase.table('talent') \
            .select('status') \
            .eq('id', talent_id) \
            .eq('organization_id', organization_id) \
            .single() \
            .execute()
        
        if not current.data:
            return None
        
        new_status = 'inactive' if current.data['status'] == 'active' else 'active'
        
        response = supabase.table('talent') \
            .update({'status': new_status}) \
            .eq('id', talent_id) \
            .eq('organization_id', organization_id) \
            .execute()
        
        return response.data[0] if response.data else None
    
    @staticmethod
    def delete_talent(organization_id, talent_id):
        """Delete talent"""
        supabase = get_supabase_admin()
        
        response = supabase.table('talent') \
            .delete() \
            .eq('id', talent_id) \
            .eq('organization_id', organization_id) \
            .execute()
        
        return True
    
    @staticmethod
    def get_statistics(organization_id):
        """Get talent statistics for the organization"""
        supabase = get_supabase_admin()
        
        response = supabase.table('talent') \
            .select('*') \
            .eq('organization_id', organization_id) \
            .execute()
        
        talent_list = response.data
        
        total_talent = len(talent_list)
        active_talent = len([t for t in talent_list if t['status'] == 'active'])
        inactive_talent = len([t for t in talent_list if t['status'] == 'inactive'])
        
        total_tasks_completed = sum(t['tasks_completed'] for t in talent_list)
        total_tasks_assigned = sum(t['tasks_assigned'] for t in talent_list)
        
        overall_completion_rate = 0
        if total_tasks_assigned > 0:
            overall_completion_rate = round((total_tasks_completed / total_tasks_assigned) * 100, 1)
        
        # Skills breakdown
        skills_breakdown = {}
        for talent in talent_list:
            skill = talent['skill_type']
            if skill not in skills_breakdown:
                skills_breakdown[skill] = 0
            skills_breakdown[skill] += 1
        
        return {
            'total_talent': total_talent,
            'active_talent': active_talent,
            'inactive_talent': inactive_talent,
            'total_tasks_completed': total_tasks_completed,
            'total_tasks_assigned': total_tasks_assigned,
            'overall_completion_rate': overall_completion_rate,
            'skills_breakdown': skills_breakdown
        }
