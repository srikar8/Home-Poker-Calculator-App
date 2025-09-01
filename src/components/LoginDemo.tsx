import React, { useState } from 'react';
import { LoginScreen } from './LoginScreen';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LogOut, User } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface LoginDemoProps {
  onLogin: (user: User) => void;
  onBack?: () => void;
}

export function LoginDemo({ onLogin, onBack }: LoginDemoProps) {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setShowLogin(false);
    // Call the parent's onLogin function
    onLogin(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLogin(true);
  };

  if (showLogin) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome, {user?.name?.split(' ')[0] || 'User'}!</CardTitle>
            <CardDescription>
              You have successfully logged in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user?.name?.split(' ')[0] || user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <Badge variant="secondary">
                {user?.id.startsWith('google') ? 'Google' : 'Email'}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>User ID:</strong> {user?.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Login Method:</strong> {user?.id.startsWith('google') ? 'Google OAuth' : 'Email/Password'}
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              
              {onBack && (
                <Button 
                  onClick={onBack}
                  variant="secondary"
                  className="w-full"
                >
                  Back to App
                </Button>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
