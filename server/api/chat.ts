import { Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import { chatWithGemini } from "../integrations/gemini/chat.js";

const MAX_CALLS_PER_HOUR = 100;
const RATE_LIMIT_WINDOW_MINUTES = 60;

export default async function handler(req: Request, res: Response) {
  console.log("DEBUG: Chat endpoint called with method:", req.method);
  try {
    if (req.method !== "POST") {
      console.log("DEBUG: Method not allowed:", req.method);
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body;
    console.log("DEBUG: Received message:", message);
    if (!message) {
      console.log("DEBUG: No message provided");
      return res.status(400).json({ error: "Message is required" });
    }

    // Get user from auth header
    const authHeader = req.headers.authorization;
    console.log("DEBUG: Auth header present:", !!authHeader);
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("DEBUG: Invalid or missing auth header");
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    console.log("DEBUG: Token extracted, verifying user...");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.log("DEBUG: Auth error:", authError);
      return res.status(401).json({ error: "Invalid authentication" });
    }
    console.log("DEBUG: User authenticated:", user.id);

    // Check rate limit
    console.log("DEBUG: Checking rate limit...");
    const { data: isAllowed } = await supabaseAdmin.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_endpoint: 'chat',
      p_max_calls: MAX_CALLS_PER_HOUR,
      p_window_minutes: RATE_LIMIT_WINDOW_MINUTES
    });

    if (!isAllowed) {
      console.log("DEBUG: Rate limit exceeded for user:", user.id);
      return res.status(429).json({
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: RATE_LIMIT_WINDOW_MINUTES * 60 // in seconds
      });
    }
    console.log("DEBUG: Rate limit check passed");

    // Get bot response
    console.log("DEBUG: Calling Gemini API...");
    const botResponse = await chatWithGemini(message);
    console.log("DEBUG: Gemini response received, length:", botResponse.length);

    // Store chat in history
    console.log("DEBUG: Storing chat in history...");
    const { error: insertError } = await supabaseAdmin
      .from('chat_history')
      .insert({
        user_id: user.id,
        user_message: message,
        bot_response: botResponse
      });

    if (insertError) {
      console.error("DEBUG: Failed to save chat:", insertError);
      // Continue since chat was successful, just couldn't save history
    } else {
      console.log("DEBUG: Chat saved successfully");
    }

    console.log("DEBUG: Returning response");
    return res.json({ botResponse });
  } catch (error) {
    console.error("DEBUG: Error in chat endpoint:", error);
    return res.status(500).json({ error: "Failed to get response from bot" });
  }
}
