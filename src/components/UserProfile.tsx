import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center space-y-0 space-x-4">
        <Avatar>
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback>
            {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">
            {user.displayName || 'User'}
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Roles</h4>
          <div className="flex flex-wrap gap-2">
            {user.roles.length > 0 ? (
              user.roles.map((role) => (
                <Badge key={role.id} variant="secondary">
                  {role.name}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">No roles assigned</span>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Permissions</h4>
          <div className="flex flex-wrap gap-2">
            {user.permissions.length > 0 ? (
              user.permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">No permissions assigned</span>
            )}
          </div>
        </div>
        
        <Button onClick={logout} variant="outline" className="w-full">
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}