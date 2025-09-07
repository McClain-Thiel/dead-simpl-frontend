import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { verifyUserAccess } from '../../lib/api';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      const redirectUrl = window.location.href;
      window.location.href = `https://dead-simpl.com?redirect_uri=${encodeURIComponent(redirectUrl)}`;
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (user && !authLoading) {
      verifyUserAccess()
        .then(({ authorized }) => {
          setAuthorized(authorized);
          setAuthError('');
        })
        .catch((error) => {
          setAuthorized(false);
          setAuthError(error.message || 'Authorization check failed');
        });
    } else if (!user && !authLoading) {
      setAuthorized(false);
      setAuthError('');
    }
  }, [user, authLoading]);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (authLoading || authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {authError || 'You are not authorized to access