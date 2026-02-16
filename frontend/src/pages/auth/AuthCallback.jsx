import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // SECURE PKCE FLOW: Get authorization code from query params (not hash!)
        // Tokens never appear in URL - only short-lived code
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        // Check for errors first
        if (error) {
          console.error('[AUTH_CALLBACK] Error:', error);
          const errorDescription = urlParams.get('error_description');
          navigate(`/login?error=${encodeURIComponent(errorDescription || 'Authentication failed')}`);
          return;
        }
        
        if (!code) {
          console.error('[AUTH_CALLBACK] No authorization code found');
          navigate('/login?error=No authorization code received');
          return;
        }
        
        console.log('[AUTH_CALLBACK] Exchanging authorization code for session...');
        
        // Exchange code for tokens securely via backend
        const response = await fetch(`${API_URL}/auth/verify-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        });
        
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to verify authorization code');
        }
        
        const data = await response.json();
        
        if (data.user && data.session) {
          // Store tokens securely (consider using httpOnly cookies in production)
          localStorage.setItem('auth_token', data.session.access_token);
          if (data.session.refresh_token) {
            localStorage.setItem('refresh_token', data.session.refresh_token);
          }
          
          // Update auth store
          login(data.user, data.session, data.organization);
          
          console.log('[AUTH_CALLBACK] Successfully authenticated');
          navigate('/dashboard');
        } else {
          throw new Error('Invalid response from server');
        }
        
      } catch (error) {
        console.error('[AUTH_CALLBACK] Error:', error);
        navigate(`/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-white text-lg">Verifying your authentication...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  );
}
