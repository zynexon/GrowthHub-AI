import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [status, setStatus] = useState('Verifying your authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // SECURE PKCE FLOW: Get authorization code from query params (not hash!)
        // Tokens never appear in URL - only short-lived code
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const type = urlParams.get('type'); // 'signup' or 'recovery' or 'invite'
        
        // Check for errors first
        if (error) {
          console.error('[AUTH_CALLBACK] Error from provider:', error);
          const errorDescription = urlParams.get('error_description');
          navigate(`/login?error=${encodeURIComponent(errorDescription || 'Authentication failed')}`);
          return;
        }
        
        // Check for legacy hash-based tokens (non-PKCE flow)
        // This handles cases where Supabase is using the implicit/hash-based flow
        // Modern Supabase typically uses query parameters, but this provides compatibility
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          console.warn('[AUTH_CALLBACK] ⚠️ Detected legacy hash-based auth flow.');
          setStatus('Completing authentication...');
          
          // Parse hash parameters
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const expiresIn = hashParams.get('expires_in');
          
          // SECURITY: Immediately clear tokens from URL to prevent leakage
          // This removes them from browser history, address bar, and prevents screenshots/sharing
          window.history.replaceState(null, '', window.location.pathname);
          console.log('[AUTH_CALLBACK] 🔒 Cleared sensitive tokens from URL');
          
          if (accessToken) {
            // Store tokens securely
            localStorage.setItem('auth_token', accessToken);
            if (refreshToken) {
              localStorage.setItem('refresh_token', refreshToken);
            }
            
            // Get user data from backend using the token
            try {
              const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              });
              
              if (response.ok) {
                const userData = await response.json();
                
                // Create session object
                const session = {
                  access_token: accessToken,
                  refresh_token: refreshToken,
                  expires_in: parseInt(expiresIn) || 3600,
                  token_type: 'bearer'
                };
                
                login(userData.user, session, userData.organization);
                console.log('[AUTH_CALLBACK] Successfully authenticated using legacy flow');
                navigate('/dashboard');
                return;
              }
            } catch (err) {
              console.error('[AUTH_CALLBACK] Error fetching user data:', err);
            }
          }
          
          // If we reach here, something failed
          navigate('/login?error=Authentication failed');
          return;
        }
        
        if (!code) {
          console.error('[AUTH_CALLBACK] No authorization code found');
          navigate('/login?error=No authorization code received. Please try again.');
          return;
        }
        
        console.log('[AUTH_CALLBACK] Exchanging authorization code for session...');
        setStatus('Exchanging authorization code...');
        
        // SECURITY: Clear the code from URL immediately to prevent reuse/leakage
        window.history.replaceState(null, '', window.location.pathname);
        console.log('[AUTH_CALLBACK] 🔒 Cleared authorization code from URL');
        
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
          console.error('[AUTH_CALLBACK] Failed to verify code:', data.error);
          throw new Error(data.error || 'Failed to verify authorization code');
        }
        
        const data = await response.json();
        
        if (data.user && data.session) {
          setStatus('Setting up your account...');
          
          // Store tokens securely (consider using httpOnly cookies in production)
          localStorage.setItem('auth_token', data.session.access_token);
          if (data.session.refresh_token) {
            localStorage.setItem('refresh_token', data.session.refresh_token);
          }
          
          // Update auth store
          login(data.user, data.session, data.organization);
          
          console.log('[AUTH_CALLBACK] ✅ Successfully authenticated via PKCE flow');
          console.log('[AUTH_CALLBACK] User:', data.user.email);
          console.log('[AUTH_CALLBACK] Organization:', data.organization?.name || 'None');
          
          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          throw new Error('Invalid response from server');
        }
        
      } catch (error) {
        console.error('[AUTH_CALLBACK] Error:', error);
        setStatus('Authentication failed');
        setTimeout(() => {
          navigate(`/login?error=${encodeURIComponent(error.message || 'Authentication failed. Please try again.')}`);
        }, 1500);
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-white text-lg">{status}</p>
        <p className="text-gray-400 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  );
}
