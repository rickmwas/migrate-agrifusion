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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // cast the chat config to any to avoid type errors if SDK types differ
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts:
            "You are an agricultural expert. Your name is AgriBot. Please keep your responses focused on farming and agriculture topics.",
        },
        {
          role: "model",
          parts:
            "I understand. I am AgriBot, an agricultural expert assistant. I will focus on providing helpful advice and information about farming, crops, soil management, and other agriculture-related topics.",
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    } as any);

    const result = await chat.sendMessage(message);
    const response = result.response;

    return response.text();
  } catch (error) {
    console.error("Error in server chatWithGemini:", error);
    throw error;
  }
}
