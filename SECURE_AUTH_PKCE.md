# Secure Authentication Flow - PKCE Implementation

## Overview
The authentication system now uses **PKCE (Proof Key for Code Exchange)** flow, following OAuth 2.0 best practices. This prevents access tokens from appearing in URLs, protecting against token theft.

## Security Benefits

### ❌ OLD FLOW (Insecure - Hash Fragment)
```
1. User clicks email confirmation link
2. Redirects to: https://app.com/#access_token=abc123...
3. Token visible in:
   - Browser history
   - Browser logs
   - Referrer headers
   - JavaScript (window.location.hash)
```

### ✅ NEW FLOW (Secure - Authorization Code)
```
1. User clicks email confirmation link
2. Redirects to: https://app.com/auth/callback?code=xyz789
3. Frontend exchanges code for tokens via secure API
4. Tokens never appear in URL
5. Code is single-use and expires quickly
```

## Implementation Details

### Backend Changes

1. **New PKCE Routes** (`app/auth/pkce_routes.py`)
   - `/api/auth/callback` - Handles Supabase auth callbacks
   - `/api/auth/verify-code` - Exchanges authorization code for session

2. **Updated AuthService** (`app/auth/services.py`)
   - `exchange_code_for_session()` - Server-side code exchange
   - Updated `signup()` - Sets proper redirect URLs
   - Updated `forgot_password()` - Uses PKCE-compatible redirects

3. **Updated Signup/Reset Flow**
   - Email confirmation links now contain codes, not tokens
   - Backend exchanges codes for tokens
   - Tokens only transmitted via secure API responses

### Frontend Changes

1. **AuthCallback Component** (`frontend/src/pages/auth/AuthCallback.jsx`)
   - Now reads `code` from query params instead of `access_token` from hash
   - Calls `/api/auth/verify-code` to exchange code for session
   - Tokens stored after secure exchange

2. **ResetPasswordPage** (`frontend/src/pages/auth/ResetPasswordPage.jsx`)
   - Reads `code` from query params
   - Exchanges code for access token via API
   - Never exposes token in URL

### Supabase Configuration

**IMPORTANT**: Configure these settings in your Supabase dashboard:

1. Go to: **Authentication → URL Configuration**

2. **Site URL**: `https://your-domain.com` or `http://localhost:5173` (dev)

3. **Redirect URLs** (whitelist):
   ```
   http://localhost:5173/auth/callback
   http://localhost:5173/reset-password
   https://your-production-domain.com/auth/callback
   https://your-production-domain.com/reset-password
   ```

4. **Enable PKCE Flow**:
   - Go to: **Authentication → Settings**
   - Enable: **"Use PKCE flow for email confirmations"**
   - Enable: **"Use PKCE flow for password recovery"**

## Testing

### Test Email Confirmation:
1. Sign up with a new email
2. Check the confirmation email
3. Click the link - URL should have `?code=...` NOT `#access_token=...`
4. Should redirect to dashboard after verification

### Test Password Reset:
1. Request password reset
2. Check the reset email
3. Click the link - URL should have `?code=...` NOT `#access_token=...`
4. Should be able to set new password

## Security Best Practices

### ✅ What We Did
- Tokens never appear in URLs
- Short-lived authorization codes (expire in 60 seconds)
- Codes are single-use only
- Server-side token exchange
- Proper redirect URL validation

### 🔒 Production Recommendations
1. **Use HTTPS only** in production
2. **Enable httpOnly cookies** for token storage (more secure than localStorage)
3. **Implement CSRF protection** for sensitive operations
4. **Set up rate limiting** on auth endpoints
5. **Use secure session management** (Redis/database-backed)
6. **Enable Supabase RLS policies** for data access control

## Troubleshooting

### Issue: "Invalid authorization code"
- **Cause**: Code expired (>60 seconds) or already used
- **Solution**: Request new confirmation/reset email

### Issue: Redirect loops
- **Cause**: Redirect URLs not whitelisted in Supabase
- **Solution**: Add all redirect URLs to Supabase dashboard

### Issue: Tokens still in URL hash
- **Cause**: PKCE not enabled in Supabase
- **Solution**: Enable PKCE flow in Supabase Auth settings

## Migration Notes

### For Existing Users
- Old hash-based auth links will continue to work temporarily
- Supabase provides backward compatibility
- New signups/resets will use PKCE flow
- Gradually all users will migrate to secure flow

### Deployment Checklist
- [ ] Update Supabase redirect URLs
- [ ] Enable PKCE in Supabase settings
- [ ] Deploy backend with new routes
- [ ] Deploy frontend with updated components
- [ ] Test signup flow
- [ ] Test password reset flow
- [ ] Monitor logs for any auth errors

## References
- [OAuth 2.0 PKCE Specification](https://tools.ietf.org/html/rfc7636)
- [Supabase PKCE Guide](https://supabase.com/docs/guides/auth/server-side/pkce)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
