import { Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import { sendToGemini } from "../llm/gemini.js";

const MAX_CALLS_PER_HOUR = 100;
const RATE_LIMIT_WINDOW_MINUTES = 60;

export default async function handler(req: Request, res: Response) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { productType, productName, imageFile } = req.body;
    if (!productType || !productName || !imageFile) {
      return res.status(400).json({ error: "productType, productName, and imageFile are required" });
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
      p_endpoint: 'quality_check',
      p_max_calls: MAX_CALLS_PER_HOUR,
      p_window_minutes: RATE_LIMIT_WINDOW_MINUTES
    });

    if (!isAllowed) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: RATE_LIMIT_WINDOW_MINUTES * 60 // in seconds
      });
    }

    // Upload image to Supabase storage
    const imageBuffer = Buffer.from(imageFile, 'base64');
    const fileName = `${Date.now()}_${user.id}_quality_check.jpg`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('public/quality-checks')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload image" });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('public/quality-checks')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // Prepare prompt for Gemini
    const prompt = `Analyze this ${productName} (${productType}) image for quality assessment.

Provide:
- Quality grade (premium/grade_a/grade_b/grade_c/reject)
- Quality score (0-100)
- Visual quality indicators (3-5 bullet points of positive aspects)
- Defects detected (list if any, or empty array)
- Market readiness (ready/needs_improvement/not_ready)
- Recommendations for improvement (detailed paragraph)
- Estimated price range in Kenyan Shillings (format: "KSh X-Y per unit")
- Expected shelf life (e.g., "5-7 days")

Context: This is for a Kenyan farmer/buyer assessing agricultural product quality.`;

    const schema = {
      type: "object",
      properties: {
        quality_grade: {
          type: "string",
          enum: ["premium", "grade_a", "grade_b", "grade_c", "reject"]
        },
        quality_score: { type: "number" },
        visual_assessment: {
          type: "array",
          items: { type: "string" }
        },
        defects_detected: {
          type: "array",
          items: { type: "string" }
        },
        market_readiness: {
          type: "string",
          enum: ["ready", "needs_improvement", "not_ready"]
        },
        recommendations: { type: "string" },
        estimated_price_range: { type: "string" },
        shelf_life: { type: "string" }
      },
      required: ["quality_grade", "quality_score", "visual_assessment", "defects_detected", "market_readiness", "recommendations", "estimated_price_range", "shelf_life"]
    };

    // Call Gemini API
    const { parsed, raw } = await sendToGemini({
      prompt,
      schema,
      maxTokens: 1024
    });

    if (!parsed) {
      console.error("Gemini parsing failed:", raw);
      return res.status(500).json({ error: "Failed to analyze image" });
    }

    // Save to quality_reports table
    const { data: report, error: insertError } = await supabaseAdmin
      .from('quality_reports')
      .insert({
        user_id: user.id,
        product_type: productType,
        product_name: productName,
        image_url: imageUrl,
        quality_grade: parsed.quality_grade,
        quality_score: parsed.quality_score,
        visual_assessment: parsed.visual_assessment,
        defects_detected: parsed.defects_detected,
        market_readiness: parsed.market_readiness,
        recommendations: parsed.recommendations,
        estimated_price_range: parsed.estimated_price_range,
        shelf_life: parsed.shelf_life
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({ error: "Failed to save report" });
    }

    // Send notification (placeholder - implement later if needed)
    // For now, just return the result

    return res.json({
      ...parsed,
      report,
      imageUrl
    });
  } catch (error) {
    console.error("Error in quality-check endpoint:", error);
    return res.status(500).json({ error: "Failed to process quality check" });
  }
}
