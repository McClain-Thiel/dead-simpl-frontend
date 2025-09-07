export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  roles: UserRole[];
  permissions: string[];
}

export interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshUserData: () => Promise<void>;
}