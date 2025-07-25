# Testing Guide: Signup Security Fixes

## Issues Fixed

### ✅ **Firebase Configuration Error**
- **Before**: `auth/invalid-app-credential` error
- **After**: Uses centralized Firebase config from `@/lib/firebase`

### ✅ **Email Verification Not Working**
- **Before**: No emails sent to users
- **After**: Real verification emails sent via Firebase Auth

### ✅ **Security Issues Resolved**
- **Before**: OTP codes logged to console
- **After**: No sensitive data in logs

## Testing Steps

### **1. Test Email Verification**

#### Step 1: Start Development Server
```bash
npm run dev
```

#### Step 2: Complete Signup Step 1
1. Go to `http://localhost:3000/signup`
2. Fill in all required fields with **real email address**
3. Use a strong password (min 6 characters)
4. Accept terms and conditions
5. Click "Continue to OTP Verification"

#### Step 3: Select Email Verification
1. Click "Receive via Email" button
2. Click "Send Email" button
3. **Check your email inbox** (including spam folder)
4. You should receive a Firebase verification email

#### Step 4: Verify Email
1. **Click the verification link** in the email
2. **Return to the signup page**
3. Click "Verify Email" button
4. Should proceed to Step 3 (Personal Information)

### **2. Test Phone Verification**

#### Step 1-2: Same as above

#### Step 3: Select Phone Verification
1. Click "Receive via Phone" button
2. Enter valid phone number (format: 09XXXXXXXXX)
3. Complete reCAPTCHA verification
4. Enter SMS code received
5. Click "Verify SMS Code"

### **3. Verify Security Fixes**

#### Check Console Logs
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Complete signup process
4. **Verify**: No OTP codes or sensitive data in console

#### Check Network Tab
1. Open Network tab in Developer Tools
2. Complete signup process
3. Check API responses
4. **Verify**: No OTP codes in response bodies

## Expected Behavior

### **Email Verification Flow**
```
User enters email → 
Firebase user created → 
Verification email sent → 
User clicks email link → 
User returns to app → 
Clicks "Verify Email" → 
Proceeds to Step 3
```

### **Phone Verification Flow**
```
User enters phone → 
reCAPTCHA verification → 
SMS sent by Firebase → 
User enters SMS code → 
Firebase verifies code → 
Proceeds to Step 3
```

## Troubleshooting

### **Email Not Received**
1. **Check spam/junk folder**
2. **Try different email provider** (Gmail, Outlook)
3. **Verify Firebase project configuration**
4. **Check browser console for errors**

### **Phone Verification Errors**
1. **Ensure phone number format**: 09XXXXXXXXX or +63XXXXXXXXX
2. **Complete reCAPTCHA verification**
3. **Check Firebase Console quotas**
4. **Verify Firebase Auth phone provider is enabled**

### **Firebase Configuration Issues**
1. **Check environment variables** in `.env.local`:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   # ... other Firebase vars
   ```

2. **Verify Firebase Console settings**:
   - Authentication > Sign-in method > Email/Password: Enabled
   - Authentication > Sign-in method > Phone: Enabled
   - Authentication > Settings > Authorized domains: Include localhost

## Environment Variables Required

### Development (.env.local)
```bash
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
```

## Success Indicators

### ✅ **Email Verification Working**
- User receives Firebase verification email
- Email has professional template
- Verification link works correctly
- User can proceed to Step 3

### ✅ **Phone Verification Working**
- reCAPTCHA appears and works
- SMS code received on phone
- Code verification succeeds
- User can proceed to Step 3

### ✅ **Security Fixed**
- No OTP codes in browser console
- No sensitive data in network responses
- No authentication errors
- Clean, secure logs

## Production Deployment

### Before Going Live
1. **Update environment variables** for production
2. **Configure Firebase Auth email templates**
3. **Add production domain** to Firebase authorized domains
4. **Test with real email addresses**
5. **Monitor Firebase Console** for errors

### Production Environment Variables
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
# ... other production configs
```

## Firebase Console Configuration

### Email Templates
1. Go to **Authentication > Templates**
2. Select **Email address verification**
3. Customize subject and body
4. Use provided template from `FIREBASE_EMAIL_SETUP.md`

### Authorized Domains
1. Go to **Authentication > Settings**
2. Add your production domain
3. Keep localhost for development

### Quotas and Limits
1. Monitor **Authentication > Usage**
2. Check SMS quotas for phone verification
3. Set up billing if needed

## Contact & Support

If you encounter issues:
1. Check browser console for detailed errors
2. Verify Firebase Console configuration
3. Test with different email providers
4. Review environment variables
5. Check Firebase project quotas

The signup system is now secure and production-ready! 🎉 