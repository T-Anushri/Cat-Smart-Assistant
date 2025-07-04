import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatbotDialog = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I'm your training assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      if (!res.ok) throw new Error("Failed to get response from assistant");
      const data = await res.json();
      const botMessage: Message = {
        id: messages.length + 2,
        text: data.response || "(No response)",
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setMessages(prev => [...prev, {
        id: messages.length + 2,
        text: "Sorry, I couldn't get a response. Please try again.",
        sender: 'bot'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <MessageCircle className="w-4 h-4" />
          Training Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Training Assistant
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg text-sm bg-muted opacity-70 italic">
                  Assistant is typing...
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg text-sm bg-red-100 text-red-700">
                  {error}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2 pt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about training..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotDialog;