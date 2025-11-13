import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function RegioBotChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hoi! Ik ben RegioBot, jouw AI-assistent voor lokale business. Ik kan je helpen met het schrijven van posts, aanbiedingen en lokale SEO. Waar kan ik je mee helpen?",
    },
  ]);
  const [input, setInput] = useState("");

  const suggestedPrompts = [
    "Schrijf een social media post",
    "Maak een aanbieding",
    "SEO tips voor mijn regio",
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Ik ben een demo-versie. In de volledige app kan ik je helpen met slimme teksten en strategieën voor je business!",
    };

    setMessages([...messages, userMessage, botMessage]);
    setInput("");
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <Card className="flex flex-col h-[600px]" data-testid="card-regiobot">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              RegioBot
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Jouw slimme business assistent</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            data-testid={`message-${message.role}-${message.id}`}
          >
            {message.role === "assistant" && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
            {message.role === "user" && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </CardContent>

      <CardFooter className="flex-col gap-3 p-4 border-t">
        <div className="flex flex-wrap gap-2 w-full">
          {suggestedPrompts.map((prompt, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="cursor-pointer hover-elevate"
              onClick={() => handlePromptClick(prompt)}
              data-testid={`badge-prompt-${idx}`}
            >
              {prompt}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 w-full">
          <Input
            placeholder="Stel een vraag aan RegioBot..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            data-testid="input-chat-message"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
