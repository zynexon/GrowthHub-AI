"""Authentication service layer."""
from flask import current_app
from typing import Dict, Any


class AuthService:
    """Handle authentication and authorization logic."""
    
    def __init__(self):
        self._supabase = None
        self._supabase_admin = None
    
    @property
    def supabase(self):
        """Lazy load supabase client"""
        if self._supabase is None:
            self._supabase = current_app.supabase
        return self._supabase
    
    @property
    def supabase_admin(self):
        """Lazy load supabase admin client for privileged operations"""
        if self._supabase_admin is None:
            self._supabase_admin = current_app.supabase_admin
        return self._supabase_admin
    
    def signup(self, email: str, password: str, full_name: str, organization_name: str) -> Dict[str, Any]:
        """Register a new user and create organization."""
        try:
            # Create user in Supabase Auth
            response = self.supabase.auth.sign_up({
                'email': email,
                'password': password,
                'options': {
                    'data': {
                        'full_name': full_name
                    }
                }
            })
            
            if response.user:
                user_id = response.user.id
                
                # Use admin client for database operations (bypasses RLS)
                admin = self.supabase_admin
                
                # Check if user profile already exists
                existing_user = admin.table('users').select('*').eq('id', user_id).execute()
                
                if not existing_user.data or len(existing_user.data) == 0:
                    # Create user profile in database
                    try:
                        print(f"[SIGNUP] Creating user profile for {user_id}")
                        admin.table('users').insert({
                            'id': user_id,
                            'email': email,
                            'full_name': full_name
                        }).execute()
                        print(f"[SIGNUP] User profile created successfully")
                    except Exception as e:
                        error_msg = str(e)
                        print(f"[SIGNUP] Failed to create user profile: {error_msg}")
                        import traceback
                        traceback.print_exc()
                        
                        # Parse common database errors
                        if 'duplicate key value' in error_msg.lower() and 'users_email_key' in error_msg:
                            return {'error': 'This email address is already registered. Please try logging in instead.'}
                        elif 'duplicate key' in error_msg.lower():
                            return {'error': 'An account with these details already exists.'}
                        else:
                            return {'error': 'Failed to create account. Please try again.'}
                
                # Check if user already has an organization
                existing_org = admin.table('user_organizations').select('*, organizations(*)').eq('user_id', user_id).execute()
                
                if existing_org.data and len(existing_org.data) > 0:
                    # User already has an organization, return it
                    org = existing_org.data[0]['organizations']
                    
                    # Convert user object to dict for JSON serialization
                    user_dict = {
                        'id': response.user.id,
                        'email': response.user.email,
                        'user_metadata': response.user.user_metadata,
                        'created_at': response.user.created_at.isoformat() if response.user.created_at else None
                    }
                    
                    session_dict = None
                    if response.session:
                        session_dict = {
                            'access_token': response.session.access_token,
                            'refresh_token': response.session.refresh_token,
                            'expires_in': response.session.expires_in,
                            'token_type': response.session.token_type
                        }
                    
                    return {
                        'user': user_dict,
                        'session': session_dict,
                        'organization': org
                    }
                
                # Create organization
                org_response = admin.table('organizations').insert({
                    'name': organization_name
                }).execute()
                
                if org_response.data and len(org_response.data) > 0:
                    org = org_response.data[0]
                    
                    # Link user to organization
                    admin.table('user_organizations').insert({
                        'user_id': user_id,
                        'organization_id': org['id'],
                        'role': 'org_owner'
                    }).execute()
                    
                    # Convert user object to dict for JSON serialization
                    user_dict = {
                        'id': response.user.id,
                        'email': response.user.email,
                        'user_metadata': response.user.user_metadata,
                        'created_at': response.user.created_at.isoformat() if response.user.created_at else None
                    }
                    
                    session_dict = None
                    if response.session:
                        session_dict = {
                            'access_token': response.session.access_token,
                            'refresh_token': response.session.refresh_token,
                            'expires_in': response.session.expires_in,
                            'token_type': response.session.token_type
                        }
                    
                    return {
                        'user': user_dict,
                        'session': session_dict,
                        'organization': org
                    }
            
            return {'error': 'Signup failed. Please try again.'}
        
        except Exception as e:
            import traceback
            error_msg = str(e)
            print(f"Signup error: {error_msg}")
            print(traceback.format_exc())
            
            # Parse common Supabase Auth errors
            if 'User already registered' in error_msg:
                return {'error': 'This email is already registered. Please try logging in instead.'}
            elif 'Email rate limit exceeded' in error_msg:
                return {'error': 'Too many signup attempts. Please try again later.'}
            elif 'Invalid email' in error_msg:
                return {'error': 'Please enter a valid email address.'}
            elif 'Password should be at least' in error_msg:
                return {'error': 'Password must be at least 6 characters long.'}
            elif 'sending confirmation email' in error_msg.lower():
                return {'error': 'Unable to send confirmation email. Please check your email address and try again.'}
            else:
                return {'error': 'Unable to create account. Please try again later.'}
    
    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user and fetch their organization."""
        try:
            response = self.supabase.auth.sign_in_with_password({
                'email': email,
                'password': password
            })
            
            if response.user:
                # Get user's organization (first one if multiple)
                admin = self.supabase_admin
                user_orgs = admin.table('user_organizations')\
                    .select('*, organizations(*)')\
                    .eq('user_id', response.user.id)\
                    .execute()
                
                organization = None
                if user_orgs.data and len(user_orgs.data) > 0:
                    organization = user_orgs.data[0]['organizations']
                
                # Convert user object to dict for JSON serialization
                user_dict = {
                    'id': response.user.id,
                    'email': response.user.email,
                    'user_metadata': response.user.user_metadata,
                    'created_at': response.user.created_at.isoformat() if response.user.created_at else None
                }
                
                session_dict = None
                if response.session:
                    session_dict = {
                        'access_token': response.session.access_token,
                        'refresh_token': response.session.refresh_token,
                        'expires_in': response.session.expires_in,
                        'token_type': response.session.token_type
                    }
                
                return {
                    'user': user_dict,
                    'session': session_dict,
                    'organization': organization
                }
            
            return {'error': 'Login failed. Please try again.'}
        
        except Exception as e:
            error_msg = str(e)
            
            # Parse common login errors
            if 'Invalid login credentials' in error_msg or 'invalid_grant' in error_msg:
                return {'error': 'Invalid email or password. Please check your credentials and try again.'}
            elif 'Email not confirmed' in error_msg:
                return {'error': 'Please confirm your email address before logging in. Check your inbox for the confirmation link.'}
            elif 'Too many requests' in error_msg or 'rate limit' in error_msg.lower():
                return {'error': 'Too many login attempts. Please try again in a few minutes.'}
            else:
                return {'error': 'Unable to log in. Please try again later.'}
    
    def logout(self, token: str) -> Dict[str, Any]:
        """Logout user."""
        try:
            self.supabase.auth.sign_out()
            return {'message': 'Logged out successfully'}
        
        except Exception as e:
            return {'error': str(e)}
    
    def get_user_profile(self, token: str) -> Dict[str, Any]:
        """Get user profile with organizations."""
        try:
            user = self.supabase.auth.get_user(token)
            
            if user:
                # Get user's organizations
                orgs = self.supabase.table('user_organizations')\
                    .select('*, organizations(*)')\
                    .eq('user_id', user.user.id)\
                    .execute()
                
                return {
                    'user': user.user,
                    'organizations': orgs.data
                }
            
            return {'error': 'User not found'}
        
        except Exception as e:
            return {'error': str(e)}
    
    def get_user_organizations(self, token: str) -> Dict[str, Any]:
        """Get organizations user belongs to."""
        try:
            user = self.supabase.auth.get_user(token)
            
            if user and user.user:
                # Use admin client to bypass RLS
                admin = self.supabase_admin
                print(f"[GET_ORGS] Looking for orgs for user: {user.user.id}")
                orgs = admin.table('user_organizations')\
                    .select('*, organizations(*)')\
                    .eq('user_id', user.user.id)\
                    .execute()
                
                print(f"[GET_ORGS] Found {len(orgs.data) if orgs.data else 0} organizations")
                print(f"[GET_ORGS] Data: {orgs.data}")
                
                return {'organizations': orgs.data}
            
            return {'error': 'User not found'}
        
        except Exception as e:
            print(f"[GET_ORGS] Error: {str(e)}")
            import traceback
            traceback.print_exc()
            import traceback
            print(f"Get organizations error: {str(e)}")
            print(traceback.format_exc())
            return {'error': str(e)}
    
    def create_organization(self, token: str, name: str, plan_type: str) -> Dict[str, Any]:
        """Create a new organization."""
        try:
            user = self.supabase.auth.get_user(token)
            
            if not user:
                return {'error': 'Unauthorized'}
            
            # Create organization
            org = self.supabase.table('organizations').insert({
                'name': name,
                'plan_type': plan_type
            }).execute()
            
            # Add user as owner
            self.supabase.table('user_organizations').insert({
                'user_id': user.user.id,
                'organization_id': org.data[0]['id'],
                'role': 'org_owner'
            }).execute()
            
            return {'organization': org.data[0]}
        
        except Exception as e:
            return {'error': str(e)}
    
    def invite_user(self, token: str, org_id: str, email: str, role: str) -> Dict[str, Any]:
        """Invite user to organization."""
        try:
            user = self.supabase.auth.get_user(token)
            
            if not user:
                return {'error': 'Unauthorized'}
            
            # Check if user is owner or admin
            user_role = self.supabase.table('user_organizations')\
                .select('role')\
                .eq('user_id', user.user.id)\
                .eq('organization_id', org_id)\
                .single()\
                .execute()
            
            if user_role.data['role'] not in ['org_owner', 'platform_admin']:
                return {'error': 'Forbidden - Only owners can invite users'}
            
            # Create invitation (simplified - in production, send email)
            invitation = self.supabase.table('invitations').insert({
                'organization_id': org_id,
                'email': email,
                'role': role,
                'invited_by': user.user.id
            }).execute()
            
            return {'invitation': invitation.data[0]}
        
        except Exception as e:
            return {'error': str(e)}
    
    def forgot_password(self, email: str) -> Dict[str, Any]:
        """Send password reset email."""
        try:
            # Get frontend URL from config
            frontend_url = current_app.config['FRONTEND_URL']
            # If FRONTEND_URL is a list (from split), use the first one
            if isinstance(frontend_url, list):
                frontend_url = frontend_url[0]
            
            # Supabase will send the reset email automatically
            self.supabase.auth.reset_password_email(email, {
                'redirect_to': f'{frontend_url}/reset-password'
            })
            
            return {'message': 'If an account exists with this email, a password reset link has been sent.'}
        
        except Exception as e:
            error_msg = str(e)
            
            # Parse common errors
            if 'rate limit' in error_msg.lower() or 'too many' in error_msg.lower():
                return {'error': 'Too many reset attempts. Please try again in a few minutes.'}
            elif 'sending' in error_msg.lower() and 'email' in error_msg.lower():
                return {'error': 'Unable to send reset email. Please try again later.'}
            else:
                # Don't reveal if email exists for security
                return {'message': 'If an account exists with this email, a password reset link has been sent.'}
    
    def reset_password(self, token: str, password: str) -> Dict[str, Any]:
        """Reset password with token."""
        try:
            # Set the session using the recovery token
            session_response = self.supabase.auth.set_session(token, token)
            
            if not session_response.user:
                return {'error': 'Invalid or expired reset link. Please request a new password reset.'}
            
            # Update password
            update_response = self.supabase.auth.update_user({
                'password': password
            })
            
            if update_response.user:
                return {'message': 'Password reset successfully. You can now log in with your new password.'}
            else:
                return {'error': 'Failed to reset password. Please try again.'}
        
        except Exception as e:
            error_msg = str(e)
            print(f"[RESET PASSWORD] Error: {error_msg}")
            
            # Parse common errors
            if 'invalid' in error_msg.lower() and 'token' in error_msg.lower():
                return {'error': 'Invalid or expired reset link. Please request a new password reset.'}
            elif 'password should be at least' in error_msg.lower():
                return {'error': 'Password must be at least 6 characters long.'}
            else:
                return {'error': 'Unable to reset password. Please try again or request a new reset link.'}
