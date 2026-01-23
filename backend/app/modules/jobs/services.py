from app.extensions import get_supabase_admin

class JobsService:
    @staticmethod
    def get_all_jobs(organization_id):
        """Get all jobs for an organization with assigned talent info"""
        supabase = get_supabase_admin()
        
        # Get jobs with talent information
        response = supabase.table('jobs') \
            .select('*, talent:assigned_talent_id(id, name, email, skill_type)') \
            .eq('organization_id', organization_id) \
            .order('created_at', desc=True) \
            .execute()
        
        return response.data
    
    @staticmethod
    def get_job(organization_id, job_id):
        """Get single job by ID with talent info"""
        supabase = get_supabase_admin()
        
        response = supabase.table('jobs') \
            .select('*, talent:assigned_talent_id(id, name, email, skill_type)') \
            .eq('id', job_id) \
            .eq('organization_id', organization_id) \
            .single() \
            .execute()
        
        return response.data
    
    @staticmethod
    def create_job(organization_id, title, job_type, required_skill=None, description=None, assigned_talent_id=None, due_date=None):
        """Create a new job"""
        supabase = get_supabase_admin()
        
        job_data = {
            'organization_id': organization_id,
            'title': title,
            'job_type': job_type,
            'required_skill': required_skill,
            'description': description,
            'assigned_talent_id': assigned_talent_id,
            'due_date': due_date,
            'status': 'open'
        }
        
        response = supabase.table('jobs') \
            .insert(job_data) \
            .execute()
        
        # Update talent task counters if assigned
        if assigned_talent_id:
            # Get current talent data
            talent = supabase.table('talent').select('*').eq('id', assigned_talent_id).single().execute()
            if talent.data:
                supabase.table('talent').update({
                    'tasks_assigned': talent.data['tasks_assigned'] + 1,
                    'tasks_pending': talent.data['tasks_pending'] + 1
                }).eq('id', assigned_talent_id).execute()
        
        return response.data[0]
    
    @staticmethod
    def update_job(organization_id, job_id, title=None, job_type=None, required_skill=None, description=None, 
                   assigned_talent_id=None, due_date=None, status=None):
        """Update job information"""
        supabase = get_supabase_admin()
        
        update_data = {}
        if title is not None:
            update_data['title'] = title
        if job_type is not None:
            update_data['job_type'] = job_type
        if required_skill is not None:
            update_data['required_skill'] = required_skill
        if description is not None:
            update_data['description'] = description
        if assigned_talent_id is not None:
            update_data['assigned_talent_id'] = assigned_talent_id
        if due_date is not None:
            update_data['due_date'] = due_date
        if status is not None:
            update_data['status'] = status
        
        if not update_data:
            return None
        
        response = supabase.table('jobs') \
            .update(update_data) \
            .eq('id', job_id) \
            .eq('organization_id', organization_id) \
            .execute()
        
        return response.data[0] if response.data else None
    
    @staticmethod
    def mark_completed(organization_id, job_id):
        """Mark job as completed"""
        supabase = get_supabase_admin()
        
        # Get job to check if it has assigned talent
        job = supabase.table('jobs').select('*').eq('id', job_id).eq('organization_id', organization_id).single().execute()
        
        print(f"[mark_completed] Job data: {job.data}")
        
        if not job.data:
            print("[mark_completed] No job found")
            return None
        
        response = supabase.table('jobs') \
            .update({'status': 'completed'}) \
            .eq('id', job_id) \
            .eq('organization_id', organization_id) \
            .execute()
        
        print(f"[mark_completed] Updated job status: {response.data}")
        
        # Update talent counters if job was assigned and not already completed
        if job.data.get('assigned_talent_id') and job.data.get('status') != 'completed':
            talent_id = job.data['assigned_talent_id']
            print(f"[mark_completed] Updating talent {talent_id} counters")
            talent = supabase.table('talent').select('*').eq('id', talent_id).single().execute()
            if talent.data:
                print(f"[mark_completed] Current talent data: tasks_completed={talent.data['tasks_completed']}, tasks_pending={talent.data['tasks_pending']}")
                update_result = supabase.table('talent').update({
                    'tasks_completed': talent.data['tasks_completed'] + 1,
                    'tasks_pending': max(0, talent.data['tasks_pending'] - 1)
                }).eq('id', talent_id).execute()
                print(f"[mark_completed] Updated talent: {update_result.data}")
        else:
            print(f"[mark_completed] Skipping talent update: assigned={job.data.get('assigned_talent_id')}, status={job.data.get('status')}")
        
        return response.data[0] if response.data else None
    
    @staticmethod
    def delete_job(organization_id, job_id):
        """Delete job"""
        supabase = get_supabase_admin()
        
        response = supabase.table('jobs') \
            .delete() \
            .eq('id', job_id) \
            .eq('organization_id', organization_id) \
            .execute()
        
        return True
    
    @staticmethod
    def get_statistics(organization_id):
        """Get job statistics for the organization"""
        supabase = get_supabase_admin()
        
        response = supabase.table('jobs') \
            .select('*') \
            .eq('organization_id', organization_id) \
            .execute()
        
        jobs_list = response.data
        
        total_jobs = len(jobs_list)
        open_jobs = len([j for j in jobs_list if j['status'] == 'open'])
        in_progress_jobs = len([j for j in jobs_list if j['status'] == 'in_progress'])
        completed_jobs = len([j for j in jobs_list if j['status'] == 'completed'])
        assigned_jobs = len([j for j in jobs_list if j['assigned_talent_id']])
        unassigned_jobs = len([j for j in jobs_list if not j['assigned_talent_id']])
        
        # Job types breakdown
        job_types_breakdown = {}
        for job in jobs_list:
            job_type = job['job_type']
            if job_type not in job_types_breakdown:
                job_types_breakdown[job_type] = 0
            job_types_breakdown[job_type] += 1
        
        return {
            'total_jobs': total_jobs,
            'open_jobs': open_jobs,
            'in_progress_jobs': in_progress_jobs,
            'completed_jobs': completed_jobs,
            'assigned_jobs': assigned_jobs,
            'unassigned_jobs': unassigned_jobs,
            'job_types_breakdown': job_types_breakdown
        }
