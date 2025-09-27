"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Bot, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { API } from "@/lib/api";
import { useRealtimeEvents } from "@/components/realtime-event-handler";
import { useSession } from "@/components/session-provider";

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
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [invitedUsername, setInvitedUsername] = useState("");
  const [invitations, setInvitations] = useState<any[]>([]);
  const { user } = useSession(); // Get the current user from session
  const { events } = useRealtimeEvents();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get current user and fetch conversations when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch from the API
        const response = await API.api.listConversationsHandler();
        const fetchedConversations = response.data;
        
        setConversations(fetchedConversations);
        setLoading(false);
        
        // Set the first conversation as selected if none is selected
        if (!selectedConversation && fetchedConversations.length > 0) {
          setSelectedConversation(fetchedConversations[0]);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        
        // Check if it's an authentication error
        if (error instanceof Error && error.message.includes('401')) {
          // Redirect to login if not authenticated
          window.location.href = '/';
          return;
        }
        
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedConversation, user]); // Add user dependency to refetch when user changes

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          // Fetch from the API
          const response = await API.api.getMessagesHandler(selectedConversation.id);
          const fetchedMessages = response.data;
          
          setMessages(fetchedMessages);
        } catch (error) {
          console.error("Error fetching messages:", error);
          
          // Check if it's an authentication error
          if (error instanceof Error && error.message.includes('401')) {
            // Redirect to login if not authenticated
            window.location.href = '/';
            return;
          }
        }
      };

      fetchMessages();
    }
  }, [selectedConversation]);

  // Fetch invitations when component mounts
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        // For now, we'll use a mock implementation for invitations
        // The generated API doesn't seem to have invitation-specific endpoints
        // But let's try to get conversations that the user is a part of
        const response = await API.api.listConversationsHandler();
        // We'll need to implement invitation logic manually if needed
        setInvitations([]);
      } catch (error) {
        console.error("Error fetching invitations:", error);
        
        // Check if it's an authentication error
        if (error instanceof Error && error.message.includes('401')) {
          // Redirect to login if not authenticated
          window.location.href = '/';
          return;
        }
      }
    };

    fetchInvitations();
  }, []);

  // Handle real-time message events
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      
      if (latestEvent.type === 'newMessage' && selectedConversation && latestEvent.data.conversationId === selectedConversation.id) {
        // Add the new message to the current conversation
        setMessages(prev => [...prev, latestEvent.data]);
      } else if (latestEvent.type === 'newConversation') {
        // Only add the conversation if it includes the current user
        const currentUserId = user?.id;
        if (currentUserId && latestEvent.data.participants?.includes(currentUserId)) {
          setConversations(prev => [latestEvent.data, ...prev]);
        }
        // Otherwise, refresh the entire list to ensure we have the latest
        else {
          const fetchData = async () => {
            try {
              const response = await API.api.listConversationsHandler();
              const fetchedConversations = response.data;
              setConversations(fetchedConversations);
            } catch (error) {
              console.error("Error fetching conversations:", error);
            }
          };
          fetchData();
        }
      } else if (latestEvent.type === 'editConversation') {
        // Update conversation in the list
        setConversations(prev => 
          prev.map(conv => 
            conv.id === latestEvent.data.id ? latestEvent.data : conv
          )
        );
      } else if (latestEvent.type === 'newInvite') {
        // Add new invitation to the list
        setInvitations(prev => [...prev, latestEvent.data]);
      }
    }
  }, [events, selectedConversation, user]);

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
      // In the message content, we need to match the rig::OneOrMany<UserContent> structure
      // For text messages, we'll just send the text content
      const response = await API.api.sendMessageHandler(selectedConversation.id, {
        content: [
          {
            type: "text",
            text: newMessage
          }
        ]
      });
      
      const messageData = response.data;
      
      // Add the message from the API response to the list
      setMessages(prev => [...prev, messageData]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('401')) {
        // Redirect to login if not authenticated
        window.location.href = '/';
        return;
      }
      
      // Fallback to local creation if API fails for other reasons
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
    }
  };

  const handleCreateConversation = async () => {
    if (!invitedUsername.trim()) {
      alert("Username is required to create a conversation.");
      return;
    }
    
    try {
      // First, look up the user by username
      let invitedUser: any;
      
      try {
        // Note: This API endpoint may not exist in the generated API, so we'll use a mock
        // For now, we'll try to search for users
        const searchResponse = await API.api.searchUsersHandler({q: invitedUsername});
        const searchResults = searchResponse.data;
        
        invitedUser = searchResults.find((user: any) => user.username === invitedUsername);
        
        if (!invitedUser) {
          alert(`User "${invitedUsername}" not found.`);
          return;
        }
      } catch (userError) {
        console.error(`Could not find user with username: ${invitedUsername}`, userError);
        // Provide more detailed error message
        if (userError instanceof Error && userError.message.includes('404')) {
          alert(`User "${invitedUsername}" does not exist. Please check the username and try again.`);
        } else {
          alert(`Error looking up user "${invitedUsername}". Please try again.`);
        }
        return;
      }
      
      // Get the current user's ID from session context
      const currentUserId = user?.id; // Get the current user's ID from session
      if (!currentUserId) {
        alert("You must be logged in to create a conversation.");
        return;
      }

      // Create a new conversation with both users
      const response = await API.api.createConversationHandler({
        userIds: [currentUserId, invitedUser.id]
      });
      
      const newConversationData = response.data;
      
      // Update local state
      setConversations(prev => [newConversationData, ...prev]);
      setSelectedConversation(newConversationData);
      setIsCreatingConversation(false);
      setInvitedUsername("");
    } catch (error) {
      console.error("Error creating conversation:", error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('401')) {
        // Redirect to login if not authenticated
        window.location.href = '/';
        return;
      }
      
      // Fallback to local creation if API fails for other reasons
      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        title: `Conversation with ${invitedUsername || "Unknown User"}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setIsCreatingConversation(false);
      setInvitedUsername("");
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
      // const response = await API.api.enhancePrompt({prompt: `Context: ${contextMessages}\n\nGenerate an appropriate response:`});
      
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
          <Dialog open={isCreatingConversation} onOpenChange={setIsCreatingConversation}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Start New Conversation</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="username" className="text-right">
                    Username
                  </label>
                  <Input
                    id="username"
                    value={invitedUsername}
                    onChange={(e) => setInvitedUsername(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter username to invite"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreatingConversation(false);
                    setInvitedUsername("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateConversation}>
                  Create Conversation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Display invitations */}
        {invitations.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Invitations</h3>
            <div className="space-y-2">
              {invitations.map(invite => (
                <div key={invite.id} className="p-3 rounded-lg border border-border bg-blue-500/10">
                  <p className="text-sm font-medium">Conversation Invite</p>
                  <p className="text-xs text-muted-foreground">{invite.message || "Join a conversation"}</p>
                  <div className="flex space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          // Implement invite response - the generated API doesn't have this endpoint exactly
                          // This might need to be implemented manually or via conversation manipulation
                          // For now, we'll just remove it from local state
                          setInvitations(prev => prev.filter(i => i.id !== invite.id));
                          // The conversation should now appear in the list
                        } catch (error) {
                          console.error("Error accepting invitation:", error);
                        }
                      }}
                    >
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          // Implement invite decline
                          setInvitations(prev => prev.filter(i => i.id !== invite.id));
                        } catch (error) {
                          console.error("Error declining invitation:", error);
                        }
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
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