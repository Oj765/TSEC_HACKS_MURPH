# Session Persistence Fix 🍪

## Issue
The user reported that clicking "Teacher Dashboard" redirected them to the "Student Dashboard" (or Landing Page). 

## Root Cause
- The application stores user session data in `localStorage` upon login.
- However, the root `App.tsx` component **did not check** this stored session on page load/refresh.
- Therefore, `role` state defaulted to `'guest'`.
- The `TeacherLayout` component has a protection check: `if (role !== 'teacher') return <Navigate to="/" />`.
- Since `role` was 'guest', it redirected the user to `/` (Landing Page/Student View) immediately.

## Fix Implemented
- Added a `useEffect` hook in `App.tsx` to read `murph:user` from `localStorage` on mount.
- If a valid session exists, it updates the `role` state immediately.
- This ensures that when a teacher refreshes the page or navigates directly to `/teacher/dashboard`, their role is correctly recognized, and the dashboard is rendered instead of redirecting.

## Files Modified
- `src/App.tsx`
