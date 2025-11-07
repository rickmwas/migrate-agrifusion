import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
// use any to avoid strict SDK typing mismatches in this repo
const genAI: any = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function chatWithGemini(
  message: string,
  context =
    "You are an AI assistant specialized in agricultural topics. You help farmers with advice about farming, crop management, weather analysis, and other agriculture-related topics. Keep your responses helpful, practical, and focused on farming."
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const result = await model.generateContent([{ text: message }]);
    const response = result.response;

    return response.text();
  } catch (error) {
    console.error("Error in server chatWithGemini:", error);
    throw error;
  }
}
