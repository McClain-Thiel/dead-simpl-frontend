import { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Alert, AlertDescription } from '../ui/alert';

interface RequirePermissionProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequirePermission({ permission, children, fallback }: RequirePermissionProps) {
  const { hasPermission, user } = useAuth();

  if (!hasPermission(permission)) {
    return fallback || (
      <Alert variant="destructive">
        <AlertDescription>
          You don't have permission to access this feature. Required permission: {permission}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

// Multiple permissions (user needs ALL of them)
interface RequirePermissionsProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequirePermissions({ permissions, children, fallback }: RequirePermissionsProps) {
  const { hasPermission } = useAuth();

  const hasAllPermissions = permissions.every(permission => hasPermission(permission));

  if (!hasAllPermissions) {
    const missingPermissions = permissions.filter(permission => !hasPermission(permission));
    
    return fallback || (
      <Alert variant="destructive">
        <AlertDescription>
          You don't have the required permissions. Missing: {missingPermissions.join(', ')}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

// Any permission (user needs at least ONE)
interface RequireAnyPermissionProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAnyPermission({ permissions, children, fallback }: RequireAnyPermissionProps) {
  const { hasPermission } = useAuth();

  const hasAnyPermission = permissions.some(permission => hasPermission(permission));

  if (!hasAnyPermission) {
    return fallback || (
      <Alert variant="destructive">
        <AlertDescription>
          You don't have permission to access this feature. Required permissions: {permissions.join(' or ')}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}