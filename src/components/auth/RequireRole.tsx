import { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Alert, AlertDescription } from '../ui/alert';

interface RequireRoleProps {
  role: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireRole({ role, children, fallback }: RequireRoleProps) {
  const { hasRole } = useAuth();

  if (!hasRole(role)) {
    return fallback || (
      <Alert variant="destructive">
        <AlertDescription>
          You don't have the required role to access this feature. Required role: {role}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

// Multiple roles (user needs ALL of them)
interface RequireRolesProps {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireRoles({ roles, children, fallback }: RequireRolesProps) {
  const { hasRole } = useAuth();

  const hasAllRoles = roles.every(role => hasRole(role));

  if (!hasAllRoles) {
    const missingRoles = roles.filter(role => !hasRole(role));
    
    return fallback || (
      <Alert variant="destructive">
        <AlertDescription>
          You don't have the required roles. Missing: {missingRoles.join(', ')}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

// Any role (user needs at least ONE)
interface RequireAnyRoleProps {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAnyRole({ roles, children, fallback }: RequireAnyRoleProps) {
  const { hasRole } = useAuth();

  const hasAnyRole = roles.some(role => hasRole(role));

  if (!hasAnyRole) {
    return fallback || (
      <Alert variant="destructive">
        <AlertDescription>
          You don't have permission to access this feature. Required roles: {roles.join(' or ')}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}