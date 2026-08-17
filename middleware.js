// middleware.js
// Vercel Edge Middleware — runs BEFORE any page is served.
// Requires a username/password before the browser ever receives index.html
// (and therefore before it ever receives the embedded Google Sheet URLs).
//
// Place this file at the ROOT of your repo (same level as index.html / package.json).
// Vercel auto-detects it — no config needed beyond the env vars below.

export const config = {
  // Protect everything. Adjust this matcher if you ever want some routes public
  // (e.g. a public status page) while keeping the dashboard itself locked.
  matcher: '/:path*',
};

export default function middleware(request) {
  const authHeader = request.headers.get('authorization');

  const validUser = process.env.RMMS_bfpnir_admin;
  const validPass = process.env.RMMS_bfpnir2026;

  // Fail closed: if the env vars aren't set, block access rather than
  // silently letting everyone through. Forces you to configure credentials
  // before this ever goes live.
  if (!validUser || !validPass) {
    return new Response(
      'Access is not configured. Set RMMS_bfpnir_admin and RMMS_bfpnir2026 in your Vercel project environment variables.',
      { status: 500 }
    );
  }

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded); // "username:password"
      const separatorIndex = decoded.indexOf(':');
      const user = decoded.substring(0, separatorIndex);
      const pass = decoded.substring(separatorIndex + 1);

      if (user === validUser && pass === validPass) {
        return; // Credentials valid — let the request through
      }
    }
  }

  // No credentials, or wrong credentials — prompt the browser's native login dialog.
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="BFP-NIR Regional Monitoring System", charset="UTF-8"',
    },
  });
}
