import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, Sparkles, FileText, Tag, CheckCircle, Scale, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
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

  const [isLoading, setIsLoading] = useState(false);
  const [activeIntent, setActiveIntent] = useState<string | undefined>();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const quickActions = [
    {
      intent: "social_post",
      label: "Maak social post",
      icon: <FileText className="h-4 w-4" />,
      prompt: "Schrijf een pakkende social media post voor mijn lokale business",
    },
    {
      intent: "offer",
      label: "Maak aanbieding",
      icon: <Tag className="h-4 w-4" />,
      prompt: "Creëer een aantrekkelijke aanbieding voor nieuwe klanten",
    },
    {
      intent: "check_text",
      label: "Check tekst",
      icon: <CheckCircle className="h-4 w-4" />,
      prompt: "Check en verbeter deze tekst: ",
    },
    {
      intent: "legal_explain",
      label: "Leg brief uit",
      icon: <Scale className="h-4 w-4" />,
      prompt: "Leg deze brief of document uit in begrijpelijke taal: ",
    },
  ];

  const handleSend = async (customMessage?: string, customIntent?: string) => {
    const messageToSend = customMessage || input;
    const intentToUse = customIntent || activeIntent;

    if (!messageToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      intent: intentToUse,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setActiveIntent(undefined);
    setIsLoading(true);

    try {
      const response = await fetch("/api/regiobot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: messageToSend,
          intent: intentToUse,
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Sorry, ik kon geen antwoord genereren.",
        intent: data.intent,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, er is iets misgegaan. Probeer het later opnieuw.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    setActiveIntent(action.intent);
    setInput(action.prompt);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Gekopieerd!",
      description: "De tekst is naar je klembord gekopieerd.",
    });
  };

  const handlePublish = (content: string) => {
    // Navigate to community page with pre-filled content
    setLocation("/community?content=" + encodeURIComponent(content));
    toast({
      title: "Naar Community",
      description: "Je kunt de tekst nu publiceren in de community.",
    });
  };

  return (
    <Card className="flex flex-col h-[600px]" data-testid="card-regiobot">
      <CardHeader className="border-b space-y-3">
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
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.intent}
              variant={activeIntent === action.intent ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickAction(action)}
              data-testid={`button-quick-${action.intent}`}
              className="gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
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
              className={`rounded-lg max-w-[80%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground p-3"
                  : "bg-card border overflow-hidden"
              }`}
            >
              <p className="text-sm p-3 whitespace-pre-wrap">
                {message.content}
              </p>
              
              {/* Action buttons for assistant responses */}
              {message.role === "assistant" && (
                <div className="flex gap-2 p-2 border-t bg-muted/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(message.content)}
                    data-testid={`button-copy-${message.id}`}
                    className="gap-1 flex-1"
                  >
                    <Copy className="h-3 w-3" />
                    Kopieer
                  </Button>
                  {(message.intent === "social_post" || message.intent === "offer") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePublish(message.content)}
                      data-testid={`button-publish-${message.id}`}
                      className="gap-1 flex-1"
                    >
                      <Share2 className="h-3 w-3" />
                      Publiceer
                    </Button>
                  )}
                </div>
              )}
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
        {activeIntent && (
          <div className="flex items-center gap-2 w-full">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {quickActions.find((a) => a.intent === activeIntent)?.label}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveIntent(undefined);
                setInput("");
              }}
              data-testid="button-clear-intent"
            >
              Wissen
            </Button>
          </div>
        )}
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
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
