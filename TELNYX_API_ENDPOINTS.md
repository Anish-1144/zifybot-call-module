# Telnyx AI Calling Agent - API Endpoints

## Overview
This document describes the Telnyx AI calling agent endpoints implemented in the backend.

## Endpoints

### 1. Initiate Call to Lead
**Endpoint:** `POST /api/telnyx/call-lead`  
**Authentication:** Required (Bearer token)  
**Description:** Initiates a call to a lead number. When the lead answers, the AI assistant automatically starts.

**Request Body:**
```json
{
  "destinationNumber": "+1234567890"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Call initiated successfully",
  "data": {
    "call": {
      "call_control_id": "...",
      "call_session_id": "...",
      ...
    }
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Failed to initiate call",
  "error": "Error message"
}
```

### 2. Webhook Handler for Call Events
**Endpoint:** `POST /api/webhook/aiagent`  
**Authentication:** Not required (public webhook)  
**Description:** Receives call events from Telnyx (call answered, hangup, etc.) and automatically starts the AI assistant when a call is answered.

**Webhook URL to configure in Telnyx:**
```
https://538e2a649876.ngrok-free.app/api/webhook/aiagent
```

**Webhook Events Handled:**
- `call.answered` - Automatically starts the AI assistant
- `call.hangup` - Logs call end information

**Note:** This endpoint always returns `200 OK` to acknowledge receipt, even if there are errors processing the event.

## Environment Variables Required

Add these to your `zifybot.backend/.env` file:

```env
# Telnyx Configuration
TELNYX_API_KEY=your_telnyx_api_key
TELNYX_CONNECTION_ID=your_telnyx_connection_id
TELNYX_PHONE_NUMBER=+1XXXXXXXXXX
TELNYX_WEBHOOK_URL=https://538e2a649876.ngrok-free.app/api/webhook/aiagent
AI_ASSISTANT_ID=your_ai_assistant_id
```

## How It Works

1. **User initiates call:** Frontend calls `POST /api/telnyx/call-lead` with destination number
2. **Backend dials lead:** Uses Telnyx SDK to dial the lead number
3. **Lead answers:** Telnyx sends `call.answered` event to webhook
4. **AI starts:** Webhook handler automatically starts the AI assistant
5. **Conversation:** AI assistant handles the conversation with the lead
6. **Call ends:** Telnyx sends `call.hangup` event when call completes

## Testing

### Test Call Initiation
```bash
curl -X POST http://localhost:5000/api/telnyx/call-lead \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"destinationNumber": "+1234567890"}'
```

### Webhook Testing
The webhook endpoint will automatically receive events from Telnyx when configured in your Telnyx Mission Control portal.

## Frontend Integration

The frontend can call the endpoint using:

```typescript
import { apiCall, API_ENDPOINTS } from '@/lib/api';

const response = await apiCall(API_ENDPOINTS.TELNYX.CALL_LEAD, {
  method: 'POST',
  body: JSON.stringify({
    destinationNumber: '+1234567890'
  })
});
```

