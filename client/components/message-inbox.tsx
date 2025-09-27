"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, AlertTriangle, Heart, Mail, Clock, Send, Bot } from "lucide-react"

const messages = [
  {
    id: 1,
    sender: "sarah_johnson",
    avatar: "/placeholder.svg?height=32&width=32",
    content: "Hi! I'm having trouble with my recent order. Can you help?",
    timestamp: "2 minutes ago",
    category: "urgent",
    status: "pending",
    priority: "high",
    agentResponse: null,
  },
  {
    id: 2,
    sender: "mike_creator",
    avatar: "/placeholder.svg?height=32&width=32",
    content: "Love your content! Keep up the amazing work 🔥",
    timestamp: "15 minutes ago",
    category: "fan_mail",
    status: "auto_replied",
    priority: "low",
    agentResponse: "Thank you so much for the kind words! Really appreciate your support! 😊",
  },
  {
    id: 3,
    sender: "spam_account_123",
    avatar: "/placeholder.svg?height=32&width=32",
    content: "🎉 CONGRATULATIONS! You've won $1000! Click here to claim...",
    timestamp: "32 minutes ago",
    category: "spam",
    status: "filtered",
    priority: "low",
    agentResponse: null,
  },
  {
    id: 4,
    sender: "business_inquiry",
    avatar: "/placeholder.svg?height=32&width=32",
    content: "Hello, I'd like to discuss a potential collaboration opportunity.",
    timestamp: "1 hour ago",
    category: "regular",
    status: "auto_replied",
    priority: "medium",
    agentResponse: "Thanks for reaching out! I'll review your proposal and get back to you within 24 hours.",
  },
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "urgent":
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case "fan_mail":
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
    case "fan_mail":
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
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [replyText, setReplyText] = useState("")

  const handleReply = () => {
    if (replyText.trim()) {
      console.log("Sending reply:", replyText)
      setReplyText("")
    }
  }

  const categorizedMessages = {
    urgent: messages.filter((m) => m.category === "urgent"),
    fan_mail: messages.filter((m) => m.category === "fan_mail"),
    regular: messages.filter((m) => m.category === "regular"),
    spam: messages.filter((m) => m.category === "spam"),
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
            <TabsTrigger value="regular" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Regular ({categorizedMessages.regular.length})
            </TabsTrigger>
            <TabsTrigger value="fan_mail" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Fan Mail ({categorizedMessages.fan_mail.length})
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
                      className="p-4 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
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
                <Button variant="outline" size="sm">
                  <Bot className="h-4 w-4 mr-2" />
                  Generate AI Response
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
