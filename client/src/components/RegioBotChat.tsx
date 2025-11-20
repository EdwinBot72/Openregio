import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, Sparkles, FileText, Tag, CheckCircle, Scale, Copy, Share2, BookOpen, BarChart3, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RegioBotMode = "general" | "legal" | "marketing";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: RegioBotMode;
}

export function RegioBotChat() {
  const [mode, setMode] = useState<RegioBotMode>("general");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hoi! Ik ben RegioBot, jouw AI-assistent voor lokale ondernemers. Kies een modus hierboven om te beginnen.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Mode-specific welcome messages and quick actions
  const modeConfig: Record<RegioBotMode, { 
    welcome: string; 
    actions: Array<{ label: string; icon: JSX.Element; prompt: string }> 
  }> = {
    general: {
      welcome: "Hoi! Ik help je met algemene bedrijfsvragen, SEO tips en zakelijke strategieën. Wat kan ik voor je doen?",
      actions: [
        {
          label: "SEO tips",
          icon: <BarChart3 className="h-4 w-4" />,
          prompt: "Geef me concrete tips om mijn lokale vindbaarheid te verbeteren",
        },
        {
          label: "Bedrijfsstrategie",
          icon: <MessageSquare className="h-4 w-4" />,
          prompt: "Help me met het ontwikkelen van een strategie voor mijn lokale business",
        },
      ],
    },
    legal: {
      welcome: "Hoi! Ik leg juridische documenten uit in begrijpelijke taal. Let op: dit is geen juridisch advies. Welk document wil je bespreken?",
      actions: [
        {
          label: "Leg brief uit",
          icon: <Scale className="h-4 w-4" />,
          prompt: "Leg deze brief of document uit in begrijpelijke taal: ",
        },
        {
          label: "Stappenplan",
          icon: <BookOpen className="h-4 w-4" />,
          prompt: "Geef me een stappenplan voor: ",
        },
      ],
    },
    marketing: {
      welcome: "Hoi! Ik help je met social media posts, blogs en aanbiedingen. Wat wil je maken?",
      actions: [
        {
          label: "Social post",
          icon: <FileText className="h-4 w-4" />,
          prompt: "Schrijf een pakkende social media post voor mijn lokale business",
        },
        {
          label: "Aanbieding",
          icon: <Tag className="h-4 w-4" />,
          prompt: "Creëer een aantrekkelijke aanbieding voor nieuwe klanten",
        },
        {
          label: "Blog artikel",
          icon: <BookOpen className="h-4 w-4" />,
          prompt: "Schrijf een SEO-vriendelijk blog artikel over: ",
        },
      ],
    },
  };

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input;

    if (!messageToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history for better context
      const history = messages
        .filter(msg => msg.role !== "assistant" || msg.content !== modeConfig[mode].welcome)
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await fetch("/api/regiobot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: messageToSend,
          mode,
          history: history.length > 0 ? history : undefined,
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Sorry, ik kon geen antwoord genereren.",
        mode: data.mode,
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

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleModeChange = (newMode: RegioBotMode) => {
    setMode(newMode);
    // Reset messages with mode-specific welcome
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: modeConfig[newMode].welcome,
        mode: newMode,
      },
    ]);
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
    <Tabs value={mode} onValueChange={(value) => handleModeChange(value as RegioBotMode)} className="w-full">
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
          
          {/* Mode Selector Tabs */}
          <TabsList className="grid w-full grid-cols-3" data-testid="tabs-mode-selector">
            <TabsTrigger value="general" className="gap-2" data-testid="tab-general">
              <MessageSquare className="h-4 w-4" />
              Algemeen
            </TabsTrigger>
            <TabsTrigger value="legal" className="gap-2" data-testid="tab-legal">
              <Scale className="h-4 w-4" />
              Juridisch
            </TabsTrigger>
            <TabsTrigger value="marketing" className="gap-2" data-testid="tab-marketing">
              <BarChart3 className="h-4 w-4" />
              Marketing
            </TabsTrigger>
          </TabsList>

          {/* Quick Actions for current mode */}
          <div className="flex flex-wrap gap-2">
            {modeConfig[mode].actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.prompt)}
                data-testid={`button-quick-${mode}-${index}`}
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
                {message.role === "assistant" && message.id !== "1" && (
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
                    {mode === "marketing" && (
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
          <div className="flex gap-2 w-full">
            <Input
              placeholder={`Vraag aan RegioBot (${mode === "general" ? "Algemeen" : mode === "legal" ? "Juridisch" : "Marketing"})...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
              disabled={isLoading}
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
    </Tabs>
  );
}
