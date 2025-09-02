# Google OAuth Setup Guide

## Current Issue
You're getting an "origin_mismatch" error because your deployed domain isn't registered as an authorized JavaScript origin in Google Cloud Console.

## Quick Fix Steps

### 1. Access Google Cloud Console
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Sign in with the Google account that owns the OAuth project
- Select your project (client ID: `704930473706-ak626kpb4btplhpod3e0bv4v20sgqh9u.apps.googleusercontent.com`)

### 2. Navigate to OAuth Configuration
- Go to **APIs & Services** → **Credentials**
- Find your OAuth 2.0 Client ID: `704930473706-ak626kpb4btplhpod3e0bv4v20sgqh9u.apps.googleusercontent.com`
- Click on it to edit

### 3. Add Authorized JavaScript Origins
In the **Authorized JavaScript origins** section, add:

```
https://www.pokerprocalculator.online
https://pokerprocalculator.online
```

If you're testing locally, also add:
```
http://localhost:3000
http://localhost:5173
```

### 4. Save and Wait
- Click **Save**
- Wait 5-10 minutes for changes to propagate
- Try logging in again

## Alternative: Create Environment Variable (Optional)

For better security, you can move the client ID to an environment variable:

1. Create a `.env` file in your project root:
```
VITE_GOOGLE_CLIENT_ID=704930473706-ak626kpb4btplhpod3e0bv4v20sgqh9u.apps.googleusercontent.com
```

2. Update `src/App.tsx`:
```tsx
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
```

3. Add `.env` to your `.gitignore` file

## Troubleshooting

### Still getting the error?
- Make sure you're using the correct Google account
- Check that the client ID matches exactly
- Try clearing browser cache and cookies
- Wait longer for Google's changes to propagate

### Multiple domains?
If you have multiple domains (staging, production), add all of them to the authorized origins.

### Local development?
Make sure `http://localhost:3000` and `http://localhost:5173` are in your authorized origins.

## Security Best Practices

1. **Use environment variables** for client IDs in production
2. **Restrict origins** to only the domains you actually use
3. **Regularly review** your OAuth configuration
4. **Monitor usage** in Google Cloud Console

## Need Help?

If you're still having issues:
1. Check the Google Cloud Console error logs
2. Verify your domain is correctly configured
3. Ensure your OAuth consent screen is properly set up
4. Contact Google Cloud support if needed
