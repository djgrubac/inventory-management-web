// Shared by every screen that talks to the API.
export const API_URL = 'http://localhost:5000';

export function toQueryString(query: object): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  return params.toString();
}

// Builds an Error from the API's ProblemDetails body so the UI can show why a
// request was rejected (e.g. "Insufficient stock ..."), not just the status.
export async function apiError(response: Response, action: string): Promise<Error> {
  try {
    const body = await response.json();
    const messages = body.errors ? Object.values(body.errors as Record<string, string[]>).flat() : [];
    const detail = messages.length ? messages.join(' ') : body.detail;
    if (detail) return new Error(detail);
  } catch {
    // Body wasn't JSON - fall through to the generic message.
  }
  return new Error(`Failed to ${action}: ${response.status}`);
}
