
'use client';

// Set session cookie (simulated with localStorage for client-side)
export const setSession = (id: number, email: string, username: string): void => {
  const isBrowser = typeof window !== 'undefined';
  if (!isBrowser) return; // Don't run on server side

  const sessionData = {
    id,
    email,
    username,
    timestamp: Date.now(),
  };
  localStorage.setItem('userSession', JSON.stringify(sessionData));
};

// Get session data
export const getSession = (): { id: number; email: string; username: string } | null => {
  const isBrowser = typeof window !== 'undefined';
  if (!isBrowser) return null; // Don't run on server side

  const sessionData = localStorage.getItem('userSession');
  if (!sessionData) return null;

  try {
    const parsed = JSON.parse(sessionData);
    // Check if session is still valid (less than 30 days old)
    const sessionAge = Date.now() - parsed.timestamp;
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    if (sessionAge > maxAge) {
      // Session expired, remove it
      localStorage.removeItem('userSession');
      return null;
    }

    return parsed;
  } catch (e) {
    console.error('Error parsing session data:', e);
    if (isBrowser) localStorage.removeItem('userSession');
    return null;
  }
};

// Clear session
export const clearSession = (): void => {
  const isBrowser = typeof window !== 'undefined';
  if (!isBrowser) return; // Don't run on server side
  localStorage.removeItem('userSession');
};
