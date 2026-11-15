import { useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { API_URL } from '../lib/api';

// fetch() against the API with the logged-in user's Auth0 access token. The
// API looks up the user's role and warehouses in its own database.
export function useApiFetch() {
  const { getAccessTokenSilently } = useAuth0();

  return useCallback(async (path: string, init: RequestInit = {}) => {
    const token = await getAccessTokenSilently();
    return fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });
  }, [getAccessTokenSilently]);
}
