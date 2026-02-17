# Supabase Email Confirmation Configuration

## 🔴 CRITICAL: Required Configuration for Email Confirmation

If users are being redirected to the login page after clicking email confirmation links instead of going directly to the dashboard, this means the **authentication flow needs proper configuration**.

## Important: PKCE in Supabase

**Note:** Supabase doesn't have a toggle to "enable PKCE" in the dashboard. Instead:
- PKCE is determined by how you initialize the Supabase client
- Modern Supabase auth flows use PKCE by default when using server-side auth
- The key is properly configuring redirect URLs and email templates

## Step-by-Step Configuration

### 1. Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**

### 2. Configure Site URL

Set your **Site URL** to:
- Development: `http://localhost:5173`
- Production: `https://your-domain.com`

### 3. Configure Redirect URLs

Add these URLs to your **Redirect URLs** whitelist:

**For Development:**
```
http://localhost:5173/auth/callback
http://localhost:5173/reset-password
http://localhost:5173/**
```

**For Production:**
```
https://your-domain.com/auth/callback
https://your-domain.com/reset-password
https://your-domain.com/**
```

### 4. Configure Email Settings

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup** template
3. Ensure the confirmation link uses: `{{ .ConfirmationURL }}`
4. The template should redirect to your callback URL

### 5. Enable Email Confirmations

1. Go to **Authentication** → **Providers**
2. Click on **Email** provider
3. Ensure **Enable email confirmations** is checked
4. Click **Save**

## How PKCE Actually Works in Supabase

### Backend Configuration (Current Setup)

Our backend uses the Supabase Python client to handle signup:

```python
response = self.supabase.auth.sign_up({
    'email': email,
    'password': password,
    'options': {
        'data': {'full_name': full_name},
        'email_redirect_to': f'{frontend_url}/auth/callback'
    }
})
```

The `email_redirect_to` parameter tells Supabase where to send users after clicking the confirmation email.

### What Happens

1. **User signs up** → Backend creates account in Supabase
2. **Supabase sends confirmation email** → Contains a link with either:
   - Modern flow: `?code=...` (authorization code)
   - Legacy flow: `#access_token=...` (implicit flow)
3. **User clicks link** → Redirects to `/auth/callback`
4. **Frontend exchanges code** → Calls backend `/auth/verify-code`
5. **Backend returns session** → User logged in and redirected to dashboard

### Why Users Might See Login Page

**Issue 1: Email Confirmation Disabled**
- If email confirmations are disabled in Supabase, users are auto-confirmed
- Backend receives a session during signup
- Users should go directly to dashboard (no email step)

**Issue 2: Email Confirmation Enabled**
- Users must confirm email before logging in
- During signup, backend gets user but no session
- Users see success message to check email
- After clicking confirmation link, they should go to dashboard

**Issue 3: Redirect URL Not Whitelisted**
- If callback URL isn't in Supabase whitelist, redirect fails
- Users may see error or get redirected to login

### 6. Verify Configuration

After configuration, test the flow:

1. **Sign up** with a new email
2. **Check the confirmation email**
3. **Inspect the confirmation link** - it should redirect to your callback URL
4. **Click the confirmation link**
5. **Should be redirected to `/dashboard` automatically**

## Common Issues and Solutions

### Issue 1: Users redirected to login page after clicking confirmation email

**Possible Causes:**
- Redirect URL not whitelisted in Supabase
- Email confirmations are enabled but callback isn't handling the token properly
- Frontend callback route not configured correctly

**Solutions:**
1. Verify redirect URL is whitelisted in Supabase (step 3 above)
2. Check browser console for errors when clicking confirmation link
3. Ensure `/auth/callback` route exists in your frontend
4. Test the backend `/auth/verify-code` endpoint

**Debug Steps:**
- Open browser developer tools
- Click the confirmation link
- Check Console tab for error messages
- Check Network tab to see if API calls are succeeding

### Issue 2: "No authorization code received" or "Invalid token" error

**Possible Causes:**
- Token expired before user clicked link
- Redirect URL mismatch
- Network/CORS issues

**Solutions:**
1. Request a new confirmation email
2. Ensure redirect URLs match exactly (no trailing slashes, correct port)
3. Check that CORS is properly configured in backend
4. Increase token expiry time in Supabase settings

### Issue 3: Email confirmation links expire too quickly

**Solution:**
1. Go to **Authentication** → **Settings → Email Auth**
2. Look for **Expiry duration** settings
3. Increase the expiry time (default is usually 1 hour)

### Issue 4: Redirect URL mismatch errors

**Solution:**
- Add your exact callback URL to the whitelist (include port number for localhost)
- Ensure there are no trailing slashes
- Check for http vs https mismatch
- Use `/**` wildcard for development: `http://localhost:5173/**`

## Understanding Auth Flows in Supabase

### Modern Flow (Default in Our Implementation)

1. User clicks confirmation link from email
2. Supabase redirects to: `/auth/callback?token_hash=...&type=signup`
3. Frontend sends code/token to backend: `POST /auth/verify-code`
4. Backend calls Supabase to exchange for session
5. Backend returns user data and session tokens
6. Frontend stores tokens and redirects to dashboard

### Legacy Hash-Based Flow (Fallback)

- Some Supabase configurations use `#access_token=` in URL
- Our app detects this and handles it automatically
- Less secure but provides backward compatibility
- You'll see a console warning if this flow is detected

## Testing Checklist

- [ ] Site URL configured in Supabase
- [ ] Redirect URLs whitelisted in Supabase  
- [ ] Email confirmation enabled (or disabled if you want auto-confirm)
- [ ] Sign up with new email
- [ ] Confirmation email received (if enabled)
- [ ] Clicking link redirects to `/auth/callback`
- [ ] User automatically redirected to `/dashboard`
- [ ] User logged in and can access dashboard features
- [ ] No errors in browser console

## Backward Compatibility

The updated `AuthCallback.jsx` component supports **multiple auth flows automatically**:

1. **Query Parameter Flow:** `?code=...` or `?token_hash=...`
2. **Legacy Hash Flow (Fallback):** `#access_token=...` in URL hash

This means the app will work regardless of your Supabase configuration. If using the legacy hash-based flow, you'll see a console warning, but authentication will still succeed.

## Need Help?

If you're still experiencing issues:

1. **Check browser console** for error messages when clicking the confirmation link
2. **Check Supabase logs** in the dashboard under Authentication → Logs
3. **Verify environment variables** are set correctly:
   - Backend: `SUPABASE_URL`, `SUPABASE_KEY`, `FRONTEND_URL`
   - Frontend: `VITE_API_URL`
4. **Ensure services are running:**
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:5173`
5. **Test the callback directly:** Visit `http://localhost:5173/auth/callback` and check for errors

## Quick Diagnostic

Run this checklist to diagnose the issue:

```bash
# 1. Check if backend is running
curl http://localhost:5000/api/health

# 2. Check if signup works
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User","organizationName":"Test Org"}'

# 3. Check Supabase connection
# Look for "✓ Supabase initialized successfully" in backend logs
```

## Additional Resources

- [Supabase Email Authentication](https://supabase.com/docs/guides/auth/auth-email)
- [Supabase Server-Side Auth](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Supabase Redirect URLs Configuration](https://supabase.com/docs/guides/auth/redirect-urls)
