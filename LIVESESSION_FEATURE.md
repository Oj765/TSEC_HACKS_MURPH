# Live Video Session Feature 🎥

## Overview
Implemented real-time video conferencing using **Jitsi Meet**. This replaces the mock "Session" view with a fully functional video meeting interface directly in the browser.

## Features
- **Video & Audio**: Full HD video and crystal-clear audio powered by Jitsi's global infrastructure.
- **Screen Sharing**: Built-in support for sharing screens.
- **Chat**: In-meeting text chat.
- **Metering**: The side panel continues to track usage duration and calculates cost in real-time ($1.25/min by default) alongside the video feed.
- **Secure Handling**: Room names are unique based on the Session ID (`Murph_Session_{id}`) to prevent unauthorized joining (in a production app, we would add JWT tokens here).

## Technical Implementation
- **Frontend**: `src/components/LiveSession.tsx` integration with `window.JitsiMeetExternalAPI`.
- **Script**: Added `https://meet.jit.si/external_api.js` to `index.html`.
- **Route**: `App.tsx` handles `/session/:id/live`.
- **Cleanup**: Jitsi instance is properly disposed of when the component unmounts or session ends.

## Usage
1. User navigates to `/session/ses_12345/live`.
2. Jitsi interface loads in the main area.
3. User grants camera/mic permissions.
4. Meeting starts.
5. Clicking "Hangup" or the "X" in the side panel ends the session and triggers the metering summary.
