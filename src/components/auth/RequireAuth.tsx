import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { apiRequest, ApiError } from '../../lib/api';
import skeletonLogo from "figma:asset/da095a0d21754e713136cd74afea19dfc8b375eb.png";

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check with backend if user is authorized
  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return; // Wait for Firebase auth to load
      
      if (!user) {
        // No Firebase user - definitely not authorized
        setIsAuthorized(false);
        setAuthChecked(true);
        return;
      }

      try {
        // Ask backend to verify the user
        await apiRequest('/api/verify-user');
        setIsAuthorized(true);
        setAuthError(null);
      } catch (error) {
        if (error instanceof ApiError) {
          setAuthError(error.message);
        } else {
          setAuthError('Authentication check failed');
        }
        setIsAuthorized(false);
      }
      setAuthChecked(true);
    };

    checkAuth();
  }, [user, loading]);

  // Still loading Firebase or backend check
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <img src={skeletonLogo} alt="DeadSimpleML" className="h-16 w-16" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-6"></div>
          <p className="text-muted-foreground">Checking if you're supposed to be here...</p>
        </div>
      </div>
    );
  }

  // Not authorized - show signin option
  if (!isAuthorized) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <img src={skeletonLogo} alt="DeadSimpleML" className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Well, this is awkward</h1>
          <p className="text-muted-foreground text-base mb-8">
            {authError === 'Authentication required. Please sign in.' 
              ? "Looks like you're not signed in. We can fix that." 
              : authError === "You don't have permission to access this feature."
              ? "You're on the waitlist! We're working through it as fast as we can."
              : authError || "Something's not right with your access. Let's get you sorted."}
          </p>
          
          {authError === "You don't have permission to access this feature." ? (
            // Waitlist case - different UI
            <div>
              <p className="text-muted-foreground text-sm mb-6">
                Good news: You're signed in! ✨<br/>
                Less good news: You're still in line. But hey, the best things are worth waiting for.
              </p>
              <div className="flex justify-center mb-4">
                <Button 
                  onClick={() => window.open('https://dead-simpl.com', '_blank')}
                  variant="outline"
                  size="lg"
                >
                  Check Waitlist Status
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                We promise we're not just sitting around eating pizza.<br/>
                (Okay, there might be some pizza involved.)
              </p>
            </div>
          ) : (
            // Regular auth case
            <div>
              <div className="flex justify-center mb-4">
                <Button 
                  onClick={() => {
                    const redirectUrl = window.location.href;
                    window.open(`https://dead-simpl.com?redirect_uri=${encodeURIComponent(redirectUrl)}`, '_blank');
                  }}
                  size="lg"
                >
                  Get Access at DeadSimpl.com
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Don't worry, we'll bring you right back here.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Authorized - show the app
  return <>{children}</>;
}
