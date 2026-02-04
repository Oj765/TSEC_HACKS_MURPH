# Troubleshooting Guide 🔧

## 1. "Earnings aggregation failed: Invalid format character '%a'"
**Cause**: The MongoDB database version being used doesn't support the abbreviated weekday format (`%a`).
**Fix**: We updated `server.js` to use the standard date format (`%Y-%m-%d`) instead. This ensures the dashboard works on all MongoDB versions.

## 2. Jitsi "Asking to join meeting" / "Moderators have not yet arrived"
**Cause**: The free public Jitsi Meet service (`meet.jit.si`) now requires the creator of a meeting to log in (using Google, Facebook, or GitHub) to prevent spam/abuse.
**Solution**:
- When you see this screen, click **"Log-in"**.
- Authenticate with any of the providers.
- The meeting will start immediately.
- This is a security feature of the Jitsi platform and cannot be bypassed in the free version.
