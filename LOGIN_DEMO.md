# Login Demo - Poker Calculator App

## Overview
This is a demo login page with Google OAuth integration for the Poker Calculator app. Currently, it's set up as a demonstration with simulated authentication.

## Features
- **Google OAuth Button**: Official Google sign-in button with One Tap support
- **Single Sign-On**: Clean, simple login with just Google OAuth
- **Welcome Message**: Shows "Welcome, [First Name]!" after login
- **User Persistence**: Remembers logged-in user across sessions
- **Responsive Design**: Mobile-first design that matches the app's existing UI
- **Demo Mode**: Currently simulates authentication (no real backend connection)
- **Error Handling**: Displays error messages for failed login attempts
- **Secure**: Uses Google's official OAuth2 implementation

## How to Access
1. Start the development server: `npm run dev`
2. Navigate to the app
3. Click the "Login Demo" button in the footer
4. Test both Google OAuth and email/password login methods

## Current Implementation
The login page currently simulates authentication:
- **Google OAuth**: Uses real Google OAuth component but simulates the response
- **Single Method**: Only Google OAuth login available (no email/password)
- **No Real Authentication**: Login attempts succeed with demo data

## Files Created
- `src/components/LoginScreen.tsx` - Main login component
- `src/components/LoginDemo.tsx` - Demo wrapper component
- Updated `src/App.tsx` - Added login screen routing
- Updated `src/components/HomeScreen.tsx` - Added login demo button

## Setting Up Real Google OAuth

### 1. Install Dependencies
```bash
npm install @react-oauth/google
```

### 2. Set Up Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add your domain to authorized origins
6. Copy the Client ID

### 3. Update the Login Component
Replace the simulated Google login in `LoginScreen.tsx`:

```tsx
import { GoogleLogin } from '@react-oauth/google';

// Replace the current Google button with:
<GoogleLogin
  onSuccess={(credentialResponse) => {
    // Handle successful login
    console.log(credentialResponse);
    // Decode JWT token and get user info
    const decoded = jwt_decode(credentialResponse.credential);
    onLogin(decoded);
  }}
  onError={() => {
    setError('Google login failed. Please try again.');
  }}
/>
```

### 4. Wrap App with GoogleOAuthProvider
In your main App component or index file:

```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      {/* Your app components */}
    </GoogleOAuthProvider>
  );
}
```

### 5. Backend Integration
For production, you'll need:
- Backend API to verify Google tokens
- User database to store authenticated users
- Session management
- Proper error handling

## Styling
The login page uses the existing UI components from the app:
- Tailwind CSS for styling
- Shadcn/ui components for consistency
- Lucide React icons
- Gradient backgrounds matching the app theme

## Next Steps

### 1. Install Dependencies
```bash
npm install @react-oauth/google jwt-decode
```

### 2. Set Up Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized origins:
     - `http://localhost:5173` (for development)
     - `http://localhost:3000` (if using different port)
     - Your production domain (when ready)
   - Copy the **Client ID**

### 3. Update Your App
Replace `"YOUR_GOOGLE_CLIENT_ID_HERE"` in `src/App.tsx` with your actual Google Client ID:

```tsx
<GoogleOAuthProvider clientId="123456789-abcdef.apps.googleusercontent.com">
```

### 4. Test the Integration
1. Start your development server: `npm run dev`
2. Navigate to the login demo
3. Click the Google login button
4. You should see the real Google OAuth popup

### 5. Backend Integration (Optional)
For production, you'll need:
- Backend API to verify Google tokens
- User database to store authenticated users
- Session management
- Proper error handling

## Current Status
✅ **UI/UX**: Complete and professional-looking  
✅ **Google OAuth integration**: Ready to connect  
✅ **Code structure**: All components updated  
⏳ **Google credentials**: Need to be configured  
⏳ **Backend**: Optional for full production

## Demo Notes
- The "Demo Mode" badge indicates this is not real authentication
- All login attempts will succeed with mock data
- The logout button resets the demo state
- The "Back to App" button returns to the main poker calculator
