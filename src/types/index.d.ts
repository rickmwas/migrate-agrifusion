import { Database } from "@/integrations/supabase/types";

declare global {
  type DBSchema = Database;
  type ChatHistory = Database["public"]["Tables"]["chat_history"]["Row"];
  type ChatMessage = {
    message: string;
  };
}