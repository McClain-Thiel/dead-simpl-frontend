import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `API request failed: ${response.statusText}`;
    
    if (response.status === 401) {
      message = 'Authentication required. Please sign in.';
    } else if (response.status === 403) {
      message = 'You don\'t have permission to access this feature.';
    }
    
    throw new ApiError(response.status, message);
  }

  return response.json();
}

export async function verifyUserAccess(): Promise<{ authorized: boolean; user: any }> {
  return apiRequest('/api/verify-user');
}