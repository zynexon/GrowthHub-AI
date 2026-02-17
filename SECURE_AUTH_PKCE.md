# Secure Authentication Flow

## Overview
The authentication system uses a secure flow where authorization codes or tokens are exchanged server-side, preventing sensitive tokens from appearing directly in browser URLs where they could be stolen.

## Security Benefits

### ❌ LESS SECURE (Hash Fragment)
```
1. User clicks email confirmation link
2. Redirects to: https://app.com/#access_token=abc123...
3. Token visible in:
   - Browser history
   - Browser logs
   - Referrer headers
   - JavaScript (window.location.hash)
```

### ✅ MORE SECURE (Server-Side Exchange)
```
1. User clicks email confirmation link
2. Redirects to: https://app.com/auth/callback?token_hash=xyz789
3. Frontend sends token/code to backend API
4. Backend exchanges with Supabase for session
5. Tokens transmitted via secure API responses only
6. Tokens never stored in browser history
```

## Implementation Details

### Backend Changes

1. **Auth Callback Routes** (`app/auth/pkce_routes.py`)
   - `/api/auth/callback` - Handles Supabase auth callbacks  
   - `/api/auth/verify-code` - Exchanges authorization code/token for session

2. **AuthService** (`app/auth/services.py`)
   - `exchange_code_for_session()` - Server-side code exchange
   - `signup()` - Sets proper redirect URLs to `/auth/callback`
   - `forgot_password()` - Configures password reset redirects

3. **Secure Signup/Reset Flow**
   - Email confirmation links redirect to frontend callback
   - Frontend extracts code/token from URL
   - Backend exchanges with Supabase for session
   - Tokens only transmitted via secure API responses

### Frontend Changes

1. **AuthCallback Component** (`frontend/src/pages/auth/AuthCallback.jsx`)
   - Reads `code` or `token_hash` from query params
   - Alternatively handles `access_token` from hash (legacy fallback)
   - Calls `/api/auth/verify-code` to exchange for session
   - Tokens stored after secure exchange

2. **ResetPasswordPage** (`frontend/src/pages/auth/ResetPasswordPage.jsx`)
   - Reads `code` from query params
   - Exchanges code for access token via API
   - Never exposes token in URL

### Supabase Configuration

**IMPORTANT**: Configure these settings in your Supabase dashboard:

1. **Go to: Authentication → URL Configuration**

2. **Site URL**: 
   - Development: `http://localhost:5173`
   - Production: `https://your-domain.com`

3. **Redirect URLs** (whitelist all these):
   ```
   http://localhost:5173/auth/callback
   http://localhost:5173/reset-password
   http://localhost:5173/**
   https://your-production-domain.com/auth/callback
   https://your-production-domain.com/reset-password
   https://your-production-domain.com/**
   ```

4. **Email Confirmation**:
   - Go to: **Authentication → Providers → Email**
   - Enable/disable **"Confirm email"** based on your needs
   - Enabled = users must click email link before logging in
   - Disabled = users can log in immediately after signup

**Note:** There is no "Enable PKCE" button in Supabase. The auth flow is determined by:
- How the Supabase client is configured in your code
- The redirect URLs you've set up
- Whether you're using server-side or client-side auth

Our implementation uses **server-side auth exchange** which provides enhanced security regardless of the specific flow Supabase uses.

## Testing

### Test Email Confirmation:
1. Sign up with a new email
2. Check the confirmation email (if email confirmation is enabled)
3. Click the link - should redirect to `/auth/callback`
4. Should automatically redirect to dashboard after verification
5. Check browser console - should see successful auth logs

### Test Password Reset:
1. Request password reset
2. Check the reset email
3. Click the link - should redirect to `/reset-password`
4. Enter new password
5. Should be able to log in with new password

### Test Without Email Confirmation:
1. Disable email confirmation in Supabase
2. Sign up with new email
3. Should be logged in immediately, redirected to dashboard
4. No confirmation email sent

## Security Best Practices

### ✅ What We Implemented
- Tokens exchanged server-side, never in URL where they could leak
- Authorization codes/tokens sent to backend API securely
- Server validates and exchanges with Supabase
- Backward compatibility for different Supabase configurations
- Proper error handling and user feedback

### 🔒 Production Recommendations
1. **Use HTTPS only** in production (enforces secure connections)
2. **Enable httpOnly cookies** for token storage (more secure than localStorage)
3. **Implement CSRF protection** for sensitive operations
4. **Set up rate limiting** on auth endpoints (prevent brute force)
5. **Use secure session management** (Redis/database-backed sessions)
6. **Enable Supabase RLS policies** for data access control
7. **Regular security audits** of auth flow

## Troubleshooting

### Issue: "Invalid authorization code" or "Failed to verify"
- **Cause**: Code/token expired or already used
- **Solution**: Request new confirmation/reset email
- **Prevention**: Increase token expiry in Supabase settings

### Issue: Redirect loops or "Authorization token required"
- **Cause**: Redirect URLs not whitelisted in Supabase
- **Solution**: Add all callback URLs to Supabase dashboard whitelist
- **Check**: Ensure no trailing slashes, correct port numbers

### Issue: Users sent to login page instead of dashboard
- **Cause**: AuthCallback not properly handling the token/code
- **Solution**: Check browser console for errors, verify backend API is running
- **Debug**: Test `/auth/verify-code` endpoint directly

## Migration Notes

### For Existing Users
- The app supports both modern and legacy auth flows automatically
- Hash-based tokens (`#access_token=`) are detected and handled
- Query parameter tokens/codes (`?code=` or `?token_hash=`) are preferred
- No user action required - the system adapts to Supabase configuration

### Deployment Checklist
- [ ] Update Supabase redirect URLs in dashboard
- [ ] Verify Site URL is correct in Supabase
- [ ] Decide whether to enable/disable email confirmation
- [ ] Deploy backend with auth routes
- [ ] Deploy frontend with updated AuthCallback
- [ ] Test signup flow end-to-end
- [ ] Test password reset flow
- [ ] Test with/without email confirmation
- [ ] Monitor logs for any auth errors
- [ ] Verify dashboard access after email confirmation

## Environment Variables

Ensure these are properly configured:

**Backend (.env):**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:5000/api
```

## References
- [Supabase Email Auth Documentation](https://supabase.com/docs/guides/auth/auth-email)
- [Supabase Server-Side Auth](https://supabase.com/docs/guides/auth/server-side-rendering)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Supabase PKCE Guide](https://supabase.com/docs/guides/auth/server-side/pkce)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
