import { Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import { chatWithGemini } from "../integrations/gemini/chat.js";

const MAX_CALLS_PER_HOUR = 100;
const RATE_LIMIT_WINDOW_MINUTES = 60;

export default async function handler(req: Request, res: Response) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: "Invalid authentication" });
    }

    // Check rate limit
    const { data: isAllowed } = await supabaseAdmin.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_endpoint: 'chat',
      p_max_calls: MAX_CALLS_PER_HOUR,
      p_window_minutes: RATE_LIMIT_WINDOW_MINUTES
    });

    if (!isAllowed) {
      return res.status(429).json({ 
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: RATE_LIMIT_WINDOW_MINUTES * 60 // in seconds
      });
    }

    // Get bot response
    const botResponse = await chatWithGemini(message);

    // Store chat in history
    const { error: insertError } = await supabaseAdmin
      .from('chat_history')
      .insert({
        user_id: user.id,
        user_message: message,
        bot_response: botResponse
      });

    if (insertError) {
      console.error("Failed to save chat:", insertError);
      // Continue since chat was successful, just couldn't save history
    }

    return res.json({ botResponse });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return res.status(500).json({ error: "Failed to get response from bot" });
  }
}