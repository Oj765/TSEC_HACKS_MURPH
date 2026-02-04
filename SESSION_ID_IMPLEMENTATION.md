# Session Creation & Custom IDs 📅

## Overview
Implemented backend logic to support scheduling sessions with custom ID formats. Teachers can schedule sessions that are stored in a designated `livesessions` collection until they are booked or go live.

## Changes

### 1. Data Model (`models/LiveSession.js`)
- **New Model**: `LiveSession` (Collection: `livesessions`)
- **Custom ID**: Uses `ses_` + 10 hex characters (e.g., `ses_7e9679b951`).
  - *Note*: Even though it's a "LiveSession", the ID prefix is `ses_` to maintain consistency with the generic session ID format requested.
- **Fields**:
  - `studentId`: Optional (initially null).
  - `status`: Defaults to `'scheduled'`.
  - `description` & `languages`: Explicitly included in the schema.

### 2. Backend API (`server.js`)
- **Endpoint**: `POST /api/sessions`
- **Logic**:
  - Now saves to `LiveSession` model instead of `Session`.
  - Accepts full scheduled session details (`topic`, `rate`, `description`, `languages`, `date/time`).
  - Calculates start/end timestamps.

### 3. Frontend Integration (`ScheduleSessionModal.tsx`)
- Updated form submission to call `POST /api/sessions`.
- Sends correct payload matching the backend expectations.

## Verification
1. Open Teacher Dashboard.
2. Click "Schedule Next Live".
3. Submit the form.
4. **Result**:
   - New document created in **`livesessions`** collection.
   - `_id` format: `ses_xxxxxxxxxx`.
   - `status`: `scheduled`.
