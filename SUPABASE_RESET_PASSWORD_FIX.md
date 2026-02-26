# Fix: Password Reset Link Redirecting to Supabase Domain

## The Problem

When clicking the password reset link in the email, you're being redirected to:
```
https://khpcmxufkqiobbxxfnsn.supabase.co/auth/v1/verify?token=...&redirect_to=http://localhost:5173/
```

Instead of going directly to:
```
http://localhost:5173/reset-password
```

## Root Cause

The issue is that the **Site URL** in Supabase has a trailing slash, which is interfering with the redirect URL construction.

## Solution

### Step 1: Update Site URL in Supabase Dashboard

1. Go to: **Authentication → URL Configuration**
2. **Site URL** field: Remove the trailing slash
   - ❌ Wrong: `http://localhost:5173/`
   - ✅ Correct: `http://localhost:5173`
3. Click **Save**

### Step 2: Verify Redirect URLs

Make sure these are in your **Redirect URLs** whitelist:
```
http://localhost:5173/auth/callback
http://localhost:5173/reset-password
http://localhost:5173/**
```

### Step 3: Check Email Template (Optional)

1. Go to: **Authentication → Email Templates**
2. Select: **Magic Link** or **Confirm signup** template
3. Ensure the link uses: `{{ .ConfirmationURL }}`
4. For password reset, it should automatically use the `redirect_to` parameter we send from the backend

### Step 4: Test the Fix

1. **Restart your backend** to apply the new logging:
   ```powershell
   cd C:\growthhub-ai\backend
   python run.py
   ```

2. Request a new password reset
3. Check the backend logs - you should see:
   ```
   [FORGOT_PASSWORD] Sending reset email to: user@example.com
   [FORGOT_PASSWORD] Redirect URL: http://localhost:5173/reset-password
   [FORGOT_PASSWORD] ✅ Reset email sent successfully
   ```

4. Check the email - the link should now work correctly

## Alternative: If Still Not Working

If Supabase continues to redirect to its own domain first, this is normal behavior. The issue is that the final redirect should go to `/reset-password` but it's going to `/` instead.

### Check URL Parameters

The Supabase verify URL should have:
- `token=...` ✅
- `type=recovery` ✅
- `redirect_to=http://localhost:5173/reset-password` ✅ ← This is what we need

If it shows `redirect_to=http://localhost:5173/` (without the path), then:

1. **Clear the Site URL** completely and **Save**
2. **Set it again** without trailing slash: `http://localhost:5173`
3. **Request a NEW password reset** (old emails will still use old config)

## Why This Happens

Supabase uses the **Site URL** as a base and sometimes appends/overrides redirect paths. When you have:
- Site URL: `http://localhost:5173/` (with slash)
- Redirect URL: `http://localhost:5173/reset-password`

Supabase might treat them as conflicting and default to the Site URL.

## Production Configuration

For production, make sure to:
1. Set Site URL to: `https://yourdomain.com` (no trailing slash)
2. Add redirect URLs:
   ```
   https://yourdomain.com/auth/callback
   https://yourdomain.com/reset-password
   https://yourdomain.com/**
   ```
3. Update `FRONTEND_URL` in your backend `.env`:
   ```
   FRONTEND_URL=https://yourdomain.com
   ```

## Need Help?

If the issue persists:
1. Check the backend terminal logs when requesting password reset
2. Copy the exact URL from the password reset email
3. Verify the `redirect_to` parameter in that URL
4. Make sure you're testing with a **NEW** password reset request after changing Supabase settings
