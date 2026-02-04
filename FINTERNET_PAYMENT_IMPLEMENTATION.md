# Finternet Payment Gateway Integration 💳

## Overview
Implemented a payment gateway integration for the Wallet feature using the provided "Finternet" API key.

## Technical Details

### 1. Backend (`/api/wallet/topup`)
- **Key Used**: `sk_hackathon_7c4bd4b69a82287aa021a3c6f3770307`
- **Method**: `POST`
- **Architecture**: **Direct API Integration**. The frontend collects payment details, and the backend communicates directly with the Finternet API. This avoids external redirects, keeping the user on your platform.
- **Logic**: 
  - Accepts `userId`, `userModel`, and `amount`.
  - Simulates a call to the external Finternet API (Placeholder URL currently).
  - On success, credits the user's wallet in MongoDB.
  - Creates a "Credit" Transaction record.

### 2. Frontend (`WalletPage.tsx`)
- **Dynamic User**: Uses the logged-in user from `localStorage`.
- **Add Funds UI**: 
  - Clicking "Add Funds" opens a panel to enter the amount.
  - "Confirm Payment" calls the backend API.
  - Automatically refreshes balance and transactions.

## How to Configure Real Endpoint
Check `server.js` line:
```javascript
const FINTERNET_API_URL = 'https://api.finternet-hackathon.example.com/charges'; // REPLACE WITH REAL URL
```
Replace this string with the actual API endpoint provided in your hackathon documentation.

## Verification
1. Log in.
2. Go to Wallet.
3. Click "Add Funds".
4. Enter `100`.
5. Confirm. 
6. Balance should update, and a "Wallet top-up via Finternet" transaction should appear.
