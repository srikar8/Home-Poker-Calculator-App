import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Chrome } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface LoginScreenProps {
  onLogin: (user: any) => void;
  onBack?: () => void;
}

export function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const [error, setError] = useState('');

  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name
      };
      onLogin(user);
    } catch (err) {
      setError('Failed to process Google login. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8" style={{ paddingBottom: '5rem' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
            <Chrome className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your Poker Calculator account
          </p>
        </div>

        <Card className="shadow-xl border-0 h-[50vh] flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100" style={{ padding: 0, paddingTop: '5rem', paddingBottom: '5rem' }}>
          <CardHeader className="space-y-3 py-12">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-base">
              Continue with your Google account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-12 pb-12 flex-1 flex flex-col justify-center">
            {/* Google OAuth Button */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Secure login powered by Google
          </p>
        </div>
      </div>
    </div>
  );
}
