"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, AlertTriangle, Heart, Mail, Clock, Send, Bot } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useRealtimeEvents } from "@/components/realtime-event-handler"

interface Message {
  id: string;
  sender: string;
  avatar?: string;
  content: string;
  timestamp: string;
  category: string;
  status: string;
  priority: string;
  agentResponse?: string | null;
  reasoning?: string; // Added for message categorization
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "urgent":
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case "sponsorship":
      return <Heart className="h-4 w-4 text-pink-500" />
    case "spam":
      return <Mail className="h-4 w-4 text-gray-500" />
    default:
      return <MessageSquare className="h-4 w-4 text-blue-500" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "urgent":
      return "bg-red-500/10 text-red-500 border-red-500/20"
    case "sponsorship":
      return "bg-pink-500/10 text-pink-500 border-pink-500/20"
    case "spam":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    default:
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    case "auto_replied":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "filtered":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    default:
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
  }
}

export function MessageInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { events } = useRealtimeEvents();

  // Fetch messages when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // In a real implementation, this would fetch from the API
        // For now, we'll simulate with some mock data that matches the backend schema
        const mockMessages: Message[] = [
          {
            id: "1",
            sender: "sarah_johnson",
            content: "Hi! I'm having trouble with my recent order. Can you help?",
            timestamp: "2 minutes ago",
            category: "urgent",
            status: "pending",
            priority: "high",
            agentResponse: null,
          },
          {
            id: "2",
            sender: "mike_creator",
            content: "Oh my god, that pasta dish you posted looks absolutely incredible! How did you get the sauce to look so creamy? I'm definitely trying this recipe this weekend!",
            timestamp: "15 minutes ago",
            category: "sponsorship",
            status: "auto_replied",
            priority: "low",
            agentResponse: "Thank you so much for the kind words! Really appreciate your support! 😊",
          },
          {
            id: "3",
            sender: "spam_account_123",
            content: "🎉 CONGRATULATIONS! You've won $1000! Click here to claim...",
            timestamp: "32 minutes ago",
            category: "spam",
            status: "filtered",
            priority: "low",
            agentResponse: null,
          },
          {
            id: "4",
            sender: "business_inquiry",
            content: "Hello! My name is David from TechCorp. I'm impressed by your culinary expertise and social media presence. We have an opening for a Food Content Specialist position that I think you'd be perfect for. Would you be interested in learning more about this opportunity?",
            timestamp: "1 hour ago",
            category: "networking",
            status: "auto_replied",
            priority: "medium",
            agentResponse: "Thanks for reaching out! I'll review your proposal and get back to you within 24 hours.",
          },
        ];
        
        setMessages(mockMessages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching messages:", error);
        
        // Check if it's an authentication error
        if (error instanceof Error && error.message.includes('401')) {
          // Redirect to login if not authenticated
          window.location.href = '/';
          return;
        }
        
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Handle real-time events
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      
      if (latestEvent.type === 'newMessage') {
        // Add new message to the list if it's a relevant message
        setMessages(prev => [...prev, latestEvent.data]);
      }
    }
  }, [events]);

  const handleReply = async () => {
    if (replyText.trim() && selectedMessage) {
      try {
        // In a real implementation, this would send the reply to the backend
        // For now, we'll just update the message locally
        console.log("Sending reply:", replyText);
        
        // Update the selected message with the agent response
        setMessages(prev => prev.map(msg => 
          msg.id === selectedMessage.id 
            ? { ...msg, agentResponse: replyText, status: 'auto_replied' } 
            : msg
        ));
        
        setReplyText("");
      } catch (error) {
        console.error("Error sending reply:", error);
        
        // Check if it's an authentication error
        if (error instanceof Error && error.message.includes('401')) {
          // Redirect to login if not authenticated
          window.location.href = '/';
          return;
        }
      }
    }
  };

  const handleGenerateAIResponse = async () => {
    if (!selectedMessage || isGenerating) return;

    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call the API to generate a response
      // For now, we'll simulate with a timeout and a mock response
      const response = await apiClient.enhancePrompt(`Message: ${selectedMessage.content}\n\nGenerate an appropriate response:`);
      
      // If API call succeeds, use the response
      setReplyText(response.output);
    } catch (error) {
      console.error("Error generating AI response:", error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('401')) {
        // Redirect to login if not authenticated
        window.location.href = '/';
        return;
      }
      
      // Simulate API call delay for mock response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI-generated responses based on message category
      const aiResponsesByCategory: Record<string, string[]> = {
        urgent: [
          "Thank you for reaching out. We're looking into this issue and will get back to you as soon as possible.",
          "I understand this is time-sensitive. Let me escalate this to our support team right away.",
          "Thanks for the update. We're prioritizing your request and will have a solution shortly."
        ],
        sponsorship: [
          "Thank you for your interest in a potential partnership. We appreciate your support of our content!",
          "We're always open to discussing collaboration opportunities. Let me connect you with our partnerships team.",
          "Your interest means a lot to us. We'd love to explore how we can work together."
        ],
        networking: [
          "Thank you for reaching out. I'd be happy to discuss potential collaboration opportunities.",
          "I appreciate the connection. Let me review your proposal and get back to you within 24 hours.",
          "Great to hear from you! I'll review your proposal and follow up shortly."
        ],
        spam: [
          "Thank you for your message. We'll review it and consider its relevance to our content.",
          "We appreciate all inquiries. Our team will review your message and respond if appropriate.",
          "Thank you for reaching out. We'll consider your proposal as we plan future content."
        ],
        default: [
          "Thank you for your message. We appreciate your interest and will respond shortly.",
          "We're grateful for your support and will get back to you soon.",
          "Thank you for reaching out. We'll review your message and respond promptly."
        ]
      };
      
      const categoryResponses = aiResponsesByCategory[selectedMessage.category] || aiResponsesByCategory['default'];
      const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
      
      // Set the generated response in the reply text
      setReplyText(randomResponse);
    } finally {
      setIsGenerating(false);
    }
  };

  const categorizedMessages = {
    urgent: messages.filter((m) => m.category === "urgent"),
    networking: messages.filter((m) => m.category === "networking"),
    sponsorship: messages.filter((m) => m.category === "sponsorship"),
    spam: messages.filter((m) => m.category === "spam"),
  };

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message Inbox
          </CardTitle>
          <CardDescription>Categorized messages with intelligent processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Message Inbox
        </CardTitle>
        <CardDescription>Categorized messages with intelligent processing</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="urgent" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="urgent" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Urgent ({categorizedMessages.urgent.length})
            </TabsTrigger>
            <TabsTrigger value="networking" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Networking ({categorizedMessages.networking.length})
            </TabsTrigger>
            <TabsTrigger value="sponsorship" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Sponsorship ({categorizedMessages.sponsorship.length})
            </TabsTrigger>
            <TabsTrigger value="spam" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Spam ({categorizedMessages.spam.length})
            </TabsTrigger>
          </TabsList>

          {Object.entries(categorizedMessages).map(([category, msgs]) => (
            <TabsContent key={category} value={category} className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {msgs.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedMessage?.id === message.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.avatar || "/placeholder.svg"} alt={message.sender} />
                            <AvatarFallback>{message.sender[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">@{message.sender}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${getCategoryColor(message.category)}`}>
                                {getCategoryIcon(message.category)}
                                <span className="ml-1">{message.category.replace("_", " ")}</span>
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(message.status)}`}>
                                {message.status.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {message.timestamp}
                        </div>
                      </div>
                      <p className="text-sm text-foreground mb-2">{message.content}</p>
                      {message.reasoning && (
                        <p className="text-xs text-muted-foreground italic mb-2">Reasoning: {message.reasoning}</p>
                      )}
                      {message.agentResponse && (
                        <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="h-4 w-4 text-primary" />
                            <span className="text-xs font-medium text-primary">Agent Response</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{message.agentResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {msgs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No {category.replace('_', ' ')} messages
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        {selectedMessage && (
          <div className="mt-6 p-4 border border-border rounded-lg bg-muted/20">
            <h4 className="font-medium mb-3">Reply to @{selectedMessage.sender}</h4>
            <Textarea
              placeholder="Type your response..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="mb-3"
              rows={3}
            />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
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
              <Button onClick={handleReply} disabled={!replyText.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send Reply
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}