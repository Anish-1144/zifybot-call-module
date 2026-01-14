import express, { Request, Response } from "express";
import Telnyx from "telnyx";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

// Helper function to get Telnyx client instance
// Initialize on-demand to ensure environment variables are loaded
const getTelnyxClient = () => {
  const telnyxApiKey = process.env.TELNYX_API_KEY || "";

  if (!telnyxApiKey) {
    throw new Error("TELNYX_API_KEY is not set");
  }

  // The Telnyx SDK constructor accepts an object with apiKey property
  // Using type assertion to bypass TypeScript type checking mismatch
  return new (Telnyx as any)({
    apiKey: telnyxApiKey,
  });
};

/**
 * POST /api/telnyx/call-lead
 * Initiate a call to a lead number
 * Requires authentication
 */
router.post("/call-lead", authenticate, async (req: Request, res: Response) => {
  try {
    const { destinationNumber } = req.body;

    if (!destinationNumber) {
      res.status(400).json({
        status: "error",
        message: "destinationNumber is required",
      });
      return;
    }

    // Validate Telnyx configuration
    const missingVars: string[] = [];
    if (!process.env.TELNYX_API_KEY) missingVars.push("TELNYX_API_KEY");
    if (!process.env.TELNYX_CONNECTION_ID)
      missingVars.push("TELNYX_CONNECTION_ID");

    // Support both TELNYX_PHONE_NUMBER and TELNYX_CALLER_NUMBER
    const phoneNumber =
      process.env.TELNYX_PHONE_NUMBER || process.env.TELNYX_CALLER_NUMBER;
    if (!phoneNumber) {
      missingVars.push("TELNYX_PHONE_NUMBER or TELNYX_CALLER_NUMBER");
    }

    if (missingVars.length > 0) {
      res.status(500).json({
        status: "error",
        message:
          "Telnyx is not configured. Missing required environment variables.",
        missingVariables: missingVars,
        help: "Please add these variables to your .env file in zifybot.backend/.env",
      });
      return;
    }

    // Get webhook URL from environment or use the provided ngrok URL
    const webhookUrl =
      process.env.TELNYX_WEBHOOK_URL ||
      "https://538e2a649876.ngrok-free.app/api/webhook/aiagent";

    // Step 1: Dial the lead using Telnyx SDK
    // Get Telnyx client instance (initialized with current env vars)
    const telnyx = getTelnyxClient();

    // Use calls.dial() method as per Telnyx SDK documentation
    const response = await telnyx.calls.dial({
      connection_id: process.env.TELNYX_CONNECTION_ID!,
      to: destinationNumber,
      from: phoneNumber!,
      webhook_url: webhookUrl,
    } as any); // Type assertion to bypass strict TypeScript checking

    console.log("Call initiated:", response.data);

    res.status(200).json({
      status: "success",
      message: "Call initiated successfully",
      data: {
        call: response.data,
      },
    });
  } catch (error: any) {
    console.error("Error initiating call:", error);

    // Handle authentication errors specifically
    if (
      error?.type === "TelnyxAuthenticationError" ||
      error?.statusCode === 401
    ) {
      const apiKey = process.env.TELNYX_API_KEY || "NOT SET";
      console.error("❌ Authentication failed - Check your TELNYX_API_KEY");
      console.error(
        "   API Key used:",
        apiKey !== "NOT SET" ? `${apiKey.substring(0, 10)}...` : "NOT SET"
      );
      console.error(
        "   Full error:",
        JSON.stringify(error.raw?.errors || error.message, null, 2)
      );

      res.status(401).json({
        status: "error",
        message: "Telnyx authentication failed",
        error:
          "Invalid or missing API key. Please check your TELNYX_API_KEY in .env file",
        hint: "Make sure your API key is correct and has the necessary permissions",
        details: error.raw?.errors || error.message,
      });
      return;
    }

    // Extract error message safely to avoid circular structure issues
    const errorMessage = error?.message || error?.toString() || "Unknown error";
    res.status(500).json({
      status: "error",
      message: "Failed to initiate call",
      error: errorMessage,
    });
  }
});

/**
 * POST /api/webhook/aiagent
 * Webhook handler for Telnyx call events
 * This endpoint receives events from Telnyx when calls are answered, hung up, etc.
 */
router.post("/aiagent", async (req: Request, res: Response) => {
  try {
    // Log the full webhook payload for debugging
    console.log("=== Webhook Received ===");
    console.log("Full body:", JSON.stringify(req.body, null, 2));

    const event = req.body.data;

    if (!event) {
      console.log("⚠️ Webhook received without data field");
      res.sendStatus(200);
      return;
    }

    console.log("📞 Event Type:", event.event_type);
    console.log("📦 Event Payload:", JSON.stringify(event.payload, null, 2));

    // Step 2: When lead answers, start AI Assistant
    if (event.event_type === "call.answered") {
      try {
        // Try multiple possible paths for call_control_id
        const callControlId =
          event.payload?.call_control_id ||
          event.call_control_id ||
          event.payload?.call_session_id;

        console.log("🔍 Extracted call_control_id:", callControlId);

        if (!callControlId) {
          console.error("❌ No call_control_id found in answered event");
          console.error("Available keys:", Object.keys(event.payload || {}));
          res.sendStatus(200);
          return;
        }

        if (!process.env.AI_ASSISTANT_ID) {
          console.error("❌ AI_ASSISTANT_ID not configured");
          res.sendStatus(200);
          return;
        }

        console.log("🤖 Starting AI Assistant...");
        console.log("   Call Control ID:", callControlId);
        console.log("   Assistant ID:", process.env.AI_ASSISTANT_ID);

        // Start AI Assistant using Telnyx SDK's post method
        // Use telnyx.post() for undocumented/newer endpoints as per Telnyx support
        const telnyx = getTelnyxClient();
        await (telnyx as any).post(
          `/v2/calls/${callControlId}/actions/ai_assistant_start`,
          {
            body: {
              assistant_id: process.env.AI_ASSISTANT_ID,
            },
          }
        );

        console.log("✅ AI Assistant started successfully!");
      } catch (error: any) {
        console.error("❌ Error starting AI Assistant:");
        console.error("   Error message:", error?.message);
        console.error("   Error response:", error?.response?.data);
        console.error("   Status code:", error?.response?.status);
        // Don't fail the webhook, just log the error
      }
    }

    // Handle call hangup
    if (event.event_type === "call.hangup") {
      const hangupCause = event.payload?.hangup_cause || "Unknown";
      console.log(
        "📴 Call ended:",
        hangupCause,
        "Call ID:",
        event.payload?.call_control_id
      );
    }

    // Handle other events for debugging
    if (!["call.answered", "call.hangup"].includes(event.event_type)) {
      console.log("ℹ️ Other event type:", event.event_type);
    }

    // Always return 200 to acknowledge receipt
    res.sendStatus(200);
  } catch (error: any) {
    console.error("❌ Error processing webhook:");
    console.error("   Error:", error?.message || error?.toString());
    // Always return 200 to prevent Telnyx from retrying
    res.sendStatus(200);
  }
});

export default router;
