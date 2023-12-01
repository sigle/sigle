export const IS_SERVER = typeof window === 'undefined';

export function getAbsoluteUrl() {
  // Get absolute url in client/browser
  if (!IS_SERVER) {
    return location.origin;
  }

  // Local env
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }

  // Get absolute url in server.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
}

export function getApiUrl() {
  if (process.env.NODE_ENV === 'development') {
    return process.env.API_URL?.replace('localhost', 'host.docker.internal');
  }

  return process.env.API_URL;
}
