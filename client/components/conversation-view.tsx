"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Bot, Users } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useRealtimeEvents } from "@/components/realtime-event-handler";

interface Conversation {
  id: string;
  title?: string;
  lastMessageId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderName?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

const mockParticipants: Participant[] = [
  { id: "1", name: "Current User", avatar: "/placeholder.svg" },
  { id: "2", name: "Sarah Johnson", avatar: "/placeholder.svg" },
  { id: "3", name: "Mike Creator", avatar: "/placeholder.svg" },
];

export function ConversationView() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { events } = useRealtimeEvents();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch conversations when component mounts
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // In a real implementation, this would fetch from the API
        // For now, we'll simulate with some mock data
        const mockConversations: Conversation[] = [
          {
            id: "conv-1",
            title: "Team Collaboration",
            createdAt: "2023-01-01T00:00:00Z",
            updatedAt: "2023-01-01T00:00:00Z",
          },
          {
            id: "conv-2",
            title: "Business Inquiries",
            createdAt: "2023-01-02T00:00:00Z",
            updatedAt: "2023-01-02T00:00:00Z",
          },
          {
            id: "conv-3",
            title: "Fan Mail",
            createdAt: "2023-01-03T00:00:00Z",
            updatedAt: "2023-01-03T00:00:00Z",
          },
        ];
        
        setConversations(mockConversations);
        setLoading(false);
        
        // Set the first conversation as selected if none is selected
        if (!selectedConversation && mockConversations.length > 0) {
          setSelectedConversation(mockConversations[0]);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, [selectedConversation]);

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          // In a real implementation, this would fetch from the API
          // For now, we'll simulate with some mock data
          const mockMessages: Message[] = [
            {
              id: "msg-1",
              conversationId: selectedConversation.id,
              senderId: "2",
              content: "Hey team, how's the project coming along?",
              createdAt: "2023-01-01T10:00:00Z",
              senderName: "Sarah Johnson",
            },
            {
              id: "msg-2",
              conversationId: selectedConversation.id,
              senderId: "1",
              content: "We're making good progress! Should be on track for the deadline.",
              createdAt: "2023-01-01T10:05:00Z",
              senderName: "Current User",
            },
            {
              id: "msg-3",
              conversationId: selectedConversation.id,
              senderId: "3",
              content: "Great to hear! I've reviewed the prototype and it looks good.",
              createdAt: "2023-01-01T10:10:00Z",
              senderName: "Mike Creator",
            },
          ];
          
          setMessages(mockMessages);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      fetchMessages();
    }
  }, [selectedConversation]);

  // Handle real-time message events
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      
      if (latestEvent.type === 'newMessage' && selectedConversation && latestEvent.data.conversationId === selectedConversation.id) {
        // Add the new message to the current conversation
        setMessages(prev => [...prev, latestEvent.data]);
      } else if (latestEvent.type === 'newConversation') {
        // Add new conversation to the list
        setConversations(prev => [latestEvent.data, ...prev]);
      }
    }
  }, [events, selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // In a real implementation, this would send to the API
      // For now, we'll add it locally
      const newMsg: Message = {
        id: Date.now().toString(),
        conversationId: selectedConversation.id,
        senderId: "1", // Current user
        content: newMessage,
        createdAt: new Date().toISOString(),
        senderName: "Current User",
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCreateConversation = async () => {
    try {
      // In a real implementation, this would create via the API
      // For now, we'll add it locally
      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        title: "New Conversation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const handleGenerateAIResponse = async () => {
    if (!selectedConversation || isGenerating) return;

    setIsGenerating(true);
    
    try {
      // Get the last few messages to provide context for the AI
      const contextMessages = messages.slice(-3).map(msg => 
        `${msg.senderName}: ${msg.content}`
      ).join('\n');
      
      // In a real implementation, this would call the API to generate a response
      // For now, we'll simulate with a timeout and a mock response
      // const response = await apiClient.enhancePrompt(`Context: ${contextMessages}\n\nGenerate an appropriate response:`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI-generated response
      const aiResponses = [
        "That's a great point! I think we should consider the implications carefully before proceeding.",
        "Thanks for sharing that. Based on our previous discussions, I believe we're on the right track.",
        "I understand your concern. Let me check our resources and get back to you with a more detailed plan.",
        "Interesting perspective! Have you considered alternative approaches to this challenge?",
        "I appreciate the feedback. Let's schedule a time to discuss this further in detail.",
        "That aligns well with our current objectives. I'll coordinate with the team to implement these ideas."
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      // Set the generated response in the message input
      setNewMessage(randomResponse);
    } catch (error) {
      console.error("Error generating AI response:", error);
      setNewMessage("Sorry, I couldn't generate a response at this time. Could you try rephrasing?");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <div className="w-1/3 border-r border-border pr-4 flex flex-col">
        <div className="mb-4">
          <Button onClick={handleCreateConversation} className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>
        
        <ScrollArea className="flex-grow">
          <div className="space-y-2">
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? "bg-primary/10 border border-primary"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <h3 className="font-medium truncate">
                  {conversation.title || `Conversation ${conversation.id}`}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {conversation.updatedAt}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Conversation View */}
      <div className="w-2/3 flex flex-col pl-4">
        {selectedConversation ? (
          <>
            <Card className="border-border bg-card flex-grow flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>{selectedConversation.title || "Untitled Conversation"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{mockParticipants.length} participants</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <ScrollArea className="flex-grow mb-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === "1" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.senderId === "1"
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted rounded-bl-none"
                          }`}
                        >
                          {message.senderId !== "1" && (
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={mockParticipants.find(p => p.id === message.senderId)?.avatar} alt={message.senderName} />
                                <AvatarFallback>{message.senderName?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">{message.senderName}</span>
                            </div>
                          )}
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="mt-auto">
                  <div className="flex items-end gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="h-fit self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleGenerateAIResponse}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Bot className="h-4 w-4 mr-2" />
                          Generate AI Response
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}