import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ChatRoom, ChatMessage } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, MessageCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

export default function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: rooms, isLoading: roomsLoading } = useQuery<ChatRoom[]>({
    queryKey: ["/api/chat/rooms"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/rooms", selectedRoomId, "messages"],
    enabled: !!selectedRoomId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string }) => {
      if (!selectedRoomId) return;
      return apiRequest("POST", `/api/chat/rooms/${selectedRoomId}/messages`, {
        userId: "current-user",
        userName: "Jan de Vries",
        message: data.message,
      });
    },
    onMutate: async (data: { message: string }) => {
      // Optimistic update
      if (!selectedRoomId) return;
      
      await queryClient.cancelQueries({ queryKey: ["/api/chat/rooms", selectedRoomId, "messages"] });
      
      const previousMessages = queryClient.getQueryData(["/api/chat/rooms", selectedRoomId, "messages"]);
      
      // Add optimistic message
      queryClient.setQueryData(["/api/chat/rooms", selectedRoomId, "messages"], (old: ChatMessage[] | undefined) => {
        const optimisticMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          roomId: selectedRoomId,
          userId: "current-user",
          userName: "Jan de Vries",
          message: data.message,
          createdAt: new Date().toISOString() as any,
        };
        return [...(old || []), optimisticMessage];
      });
      
      return { previousMessages };
    },
    onSuccess: () => {
      // Refresh from server for consistency
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms", selectedRoomId, "messages"] });
      setNewMessage("");
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMessages && selectedRoomId) {
        queryClient.setQueryData(["/api/chat/rooms", selectedRoomId, "messages"], context.previousMessages);
      }
      toast({
        title: "Fout",
        description: "Kon bericht niet versturen",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (rooms && rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate({ message: newMessage });
  };

  const selectedRoom = rooms?.find((r) => r.id === selectedRoomId);

  if (roomsLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-accent text-3xl font-bold mb-2">Chat Kamers</h1>
          <p className="text-muted-foreground">Verbind met lokale ondernemers</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eef2f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MessageSquare style={{ width: 24, height: 24, color: "#0b2240" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }}>Chat</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Verbind met lokale ondernemers</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-5rem)]">
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Kamers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-2">
                  {rooms?.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors hover-elevate ${
                        selectedRoomId === room.id
                          ? "bg-primary/10 border border-primary"
                          : "bg-card hover:bg-accent"
                      }`}
                      data-testid={`button-chat-room-${room.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">{room.name}</div>
                          {room.description && (
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {room.description}
                            </div>
                          )}
                        </div>
                        {room.category && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {room.category}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-9">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {selectedRoom?.name || "Selecteer een kamer"}
              </CardTitle>
              {selectedRoom?.description && (
                <CardDescription>{selectedRoom.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messagesLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Berichten laden...</p>
                    </div>
                  ) : messages && messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className="flex flex-col gap-1"
                        data-testid={`message-${message.id}`}
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-sm">{message.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.createdAt), {
                              addSuffix: true,
                              locale: nl,
                            })}
                          </span>
                        </div>
                        <div className="bg-muted rounded-lg px-4 py-2 inline-block max-w-2xl">
                          {message.message}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nog geen berichten. Start het gesprek!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Typ een bericht..."
                    className="flex-1"
                    disabled={!selectedRoomId || sendMessageMutation.isPending}
                    data-testid="input-chat-message"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
  );
}
