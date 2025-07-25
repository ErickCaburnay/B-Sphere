# Firebase Auth Email Verification Setup Guide

## Overview
This guide explains how to configure Firebase Authentication to send actual verification emails to users during the signup process. The system now uses Firebase Auth's built-in email verification instead of custom OTP codes.

## How It Works

### Email Verification Flow
1. **User enters email** → Step 1 of signup
2. **System creates Firebase user** → Temporary disabled user
3. **Firebase sends verification email** → Automatic email with link
4. **User clicks email link** → Verifies email with Firebase
5. **User returns to app** → Clicks "Verify Email" button
6. **System checks verification status** → Enables user and continues signup

### No More OTP Codes
- ✅ **Before**: Custom 6-digit OTP codes logged to console
- ✅ **Now**: Firebase Auth verification links sent via email
- ✅ **Security**: No sensitive codes in logs or API responses

## Firebase Console Configuration

### Step 1: Enable Email/Password Authentication
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Email/Password** provider
5. Click **Save**

### Step 2: Configure Email Templates
1. Go to **Authentication** > **Templates**
2. Click on **Email address verification**
3. Customize the email template:

#### Recommended Email Template:
```html
<h2>Welcome to B-Sphere!</h2>
<p>Hello,</p>
<p>Thank you for signing up for B-Sphere, your Barangay Information Management System.</p>
<p>Please click the link below to verify your email address and complete your registration:</p>
<p><a href="%LINK%" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a></p>
<p>Or copy and paste this link in your browser:</p>
<p>%LINK%</p>
<p>This link will expire in 1 hour for security reasons.</p>
<p>If you didn't create an account with us, please ignore this email.</p>
<p>Best regards,<br>The B-Sphere Team</p>
```

### Step 3: Configure Authorized Domains
1. Go to **Authentication** > **Settings**
2. Scroll to **Authorized domains**
3. Add your domains:
   - `localhost` (for development)
   - `your-domain.com` (for production)
   - `your-app.vercel.app` (if using Vercel)

### Step 4: Customize Action URL (Optional)
1. In **Authentication** > **Settings**
2. Find **Action URL** section
3. Set to your app's domain: `https://your-domain.com`

## Environment Configuration

### Required Environment Variables
```bash
# Firebase Configuration (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# App URL for verification links
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Firebase Admin (for server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Testing the Email Verification

### Development Testing
1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Go to signup page**: `http://localhost:3000/signup`

3. **Complete Step 1** with a real email address

4. **Select "Email" verification** method

5. **Check your email inbox** for Firebase verification email

6. **Click the verification link** in the email

7. **Return to signup page** and click "Verify Email"

8. **Continue to Step 3** if verification successful

### Production Testing
1. Deploy your app to production
2. Use a real email address for testing
3. Ensure NEXT_PUBLIC_APP_URL points to your production domain
4. Test the complete flow

## Troubleshooting

### Common Issues

#### 1. No Email Received
**Possible Causes:**
- Email provider blocking Firebase emails
- Incorrect email address
- Firebase project not properly configured

**Solutions:**
- Check spam/junk folder
- Try different email provider (Gmail, Outlook)
- Verify Firebase project settings
- Check Firebase Console logs

#### 2. Verification Link Not Working
**Possible Causes:**
- Domain not in authorized domains list
- Incorrect NEXT_PUBLIC_APP_URL
- Link expired (1 hour limit)

**Solutions:**
- Add domain to authorized domains
- Check environment variable
- Request new verification email

#### 3. "Email Not Verified" Error
**Possible Causes:**
- User didn't click verification link
- Link clicked but page didn't load properly
- Firebase Auth state not updated

**Solutions:**
- Ensure user clicks link in email
- Check browser console for errors
- Try refreshing the page after clicking link

## Email Providers Compatibility

### Tested Email Providers
- ✅ **Gmail** - Works perfectly
- ✅ **Outlook/Hotmail** - Works well
- ✅ **Yahoo Mail** - Works well
- ✅ **Custom domains** - Depends on spam filters

### Email Deliverability Tips
1. **Configure SPF/DKIM** for your domain
2. **Whitelist Firebase domains**:
   - `noreply@your-project.firebaseapp.com`
   - `*.firebaseapp.com`
3. **Test with multiple email providers**
4. **Monitor Firebase Console** for delivery issues

## Security Features

### Built-in Security
- ✅ **Link expiration**: 1 hour timeout
- ✅ **One-time use**: Links can't be reused
- ✅ **Domain validation**: Only authorized domains work
- ✅ **Rate limiting**: Prevents spam/abuse

### Additional Security
- User account disabled until email verified
- Temporary verification records auto-expire
- No sensitive data in logs or API responses

## Monitoring and Analytics

### Firebase Console Monitoring
1. Go to **Authentication** > **Users**
2. Check user verification status
3. Monitor failed verification attempts

### Custom Analytics (Optional)
```javascript
// Track email verification events
analytics.track('email_verification_sent', {
  email: userEmail,
  timestamp: new Date(),
  method: 'firebase_auth'
});
```

## Migration Notes

### Changes from Previous System
- **Removed**: Custom OTP generation and logging
- **Added**: Firebase Auth email verification
- **Improved**: No sensitive data exposure
- **Enhanced**: Better user experience with email links

### Backward Compatibility
- Phone verification still uses OTP (Firebase Auth client-side)
- API endpoints remain the same
- Frontend UI updated for better UX

## Support

If you encounter issues:
1. Check Firebase Console logs
2. Verify environment variables
3. Test with different email providers
4. Check browser console for errors
5. Review Firebase Auth documentation

## Next Steps

After email verification is working:
1. ✅ Configure Firebase Auth email templates
2. ✅ Test with real email addresses  
3. ✅ Deploy to production
4. ✅ Monitor email deliverability
5. ✅ Set up proper domain authentication 