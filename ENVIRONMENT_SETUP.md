# Environment Variables Setup

## Required Environment Variables

Your app requires the following environment variables to work properly:

### Supabase Configuration
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### Google OAuth (Optional)
- `VITE_GOOGLE_CLIENT_ID` - Your Google OAuth client ID

## How to Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key**

## Deployment Setup (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `VITE_SUPABASE_URL` = your_supabase_project_url
   - `VITE_SUPABASE_ANON_KEY` = your_supabase_anon_key
5. Redeploy your application

## Local Development Setup

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GOOGLE_CLIENT_ID=704930473706-ak626kpb4btplhpod3e0bv4v20sgqh9u.apps.googleusercontent.com
```

**Important:** Add `.env` to your `.gitignore` file to keep your credentials secure.

## Security Notes

- Never commit your `.env` file to version control
- The `VITE_` prefix makes these variables available in the browser
- Only use public/anonymous keys in frontend applications
- Keep your service role keys secure and server-side only
