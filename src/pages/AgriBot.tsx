import { useState } from "react";
import { Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  user_id: string;
  user_message: string;
  bot_response: string;
  created_at: string;
}

export default function AgriBot() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch chat history
  const { data: chatHistory } = useQuery({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching chat history:", error);
        return [];
      }

      return data as ChatMessage[];
    },
  });

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error("User not authenticated");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from bot");
      }

      const { botResponse } = await response.json();

      // Store the chat in Supabase
      const { error } = await supabase.from("chat_history").insert({
        user_id: user.user.id,
        user_message: message,
        bot_response: botResponse,
      });

      if (error) {
        console.error("Error saving chat:", error);
      }

      // Invalidate and refetch chat history
      // You'll need to add queryClient from react-query to do this properly
      // For now, you can reload the page or implement optimistic updates
      
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 lg:p-12">
        <h1 className="text-4xl font-bold">AgriBot Assistant</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          Your AI farming companion. Ask me anything about agriculture!
        </p>

        {/* Chat Messages */}
        <div className="space-y-4 mb-6 max-w-3xl">
          {chatHistory?.map((chat) => (
            <div key={chat.id} className="space-y-4">
              {/* User Message */}
              <Card className="p-4 ml-auto max-w-[80%] bg-primary text-primary-foreground">
                <p>{chat.user_message}</p>
              </Card>

              {/* Bot Response */}
              <Card className="p-4 mr-auto max-w-[80%]">
                <p className="whitespace-pre-wrap">{chat.bot_response}</p>
              </Card>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="fixed bottom-6 left-6 right-6 lg:left-[calc(256px+3rem)] lg:right-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about farming..."
                className="resize-none"
                rows={1}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
                className={cn("px-8", {
                  "opacity-50 cursor-not-allowed": isLoading,
                })}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}