import { useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { API_URL } from '../lib/api';

// Auth0 errors from getAccessTokenSilently that mean the session is gone and
// only a fresh login can get a new token.
const LOGIN_REQUIRED_ERRORS = new Set([
  'login_required',
  'consent_required',
  'interaction_required',
  'missing_refresh_token',
  'invalid_grant',
]);

// When the last session-expired redirect happened. If the API rejects even a
// freshly issued token (e.g. an audience mismatch), stop redirecting so the
// user sees the error instead of looping through the login page.
const REDIRECT_KEY = 'auth.lastSessionRedirect';
const REDIRECT_COOLDOWN_MS = 30_000;

function isLoginRequired(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'error' in err
    && LOGIN_REQUIRED_ERRORS.has(String((err as { error: unknown }).error));
}

function redirectedRecently(): boolean {
  try {
    const last = Number(sessionStorage.getItem(REDIRECT_KEY));
    return Date.now() - last < REDIRECT_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function rememberRedirect() {
  try {
    sessionStorage.setItem(REDIRECT_KEY, String(Date.now()));
  } catch {
    // Storage blocked: the cooldown just won't apply.
  }
}

// fetch() against the API with the logged-in user's Auth0 access token. The
// API looks up the user's role and warehouses in its own database.
// If the session has expired (Auth0 can't renew the token, or the API answers
// 401), the user is sent to the login page and comes back to this page after.
export function useApiFetch() {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0();

  return useCallback(async (path: string, init: RequestInit = {}) => {
    const sendToLogin = async (): Promise<never> => {
      rememberRedirect();
      // Auth0Provider's default onRedirectCallback restores appState.returnTo.
      await loginWithRedirect({
        appState: { returnTo: window.location.pathname + window.location.search },
      });
      throw new Error('Your session has expired. Redirecting to login…');
    };

    let token: string | undefined;
    try {
      token = await getAccessTokenSilently();
    } catch (err) {
      if (isLoginRequired(err) && !redirectedRecently()) return sendToLogin();
      throw err;
    }
    if (!token && !redirectedRecently()) return sendToLogin();

    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 && !redirectedRecently()) return sendToLogin();
    return response;
  }, [getAccessTokenSilently, loginWithRedirect]);
}
