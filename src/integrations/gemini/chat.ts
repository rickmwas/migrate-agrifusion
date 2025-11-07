// Client-side stub for Gemini integration.
// The real Gemini SDK is server-only and must not be bundled into the browser.
// Importing this file in the client will throw and direct developers to call the server API.

export function chatWithGemini(): never {
  throw new Error(
    "chatWithGemini was imported in client code. Use the server API endpoint '/api/chat' instead."
  );
}

//import { ClientRequest supabaseAdmin } from "http";
//import { lucide-react} from "/"-sijui ni nini hii