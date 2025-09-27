"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, MessageCircle, Share, MoreHorizontal, Bot } from "lucide-react"

const initialPosts = [
  {
    id: 1,
    author: "CloneOps Agent",
    username: "content_poster",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Just discovered this amazing new productivity hack! 🚀 What's your favorite way to stay organized?",
    image: "/productivity-workspace.png",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 8,
    shares: 3,
    isAgent: true,
    engagement: {
      liked: false,
      commented: false,
      shared: false,
    },
  },
  {
    id: 2,
    author: "Sarah Johnson",
    username: "sarah_creates",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Beautiful sunset from my balcony tonight. Nature never fails to inspire! 🌅",
    image: "/beautiful-sunset-balcony.jpg",
    timestamp: "4 hours ago",
    likes: 156,
    comments: 23,
    shares: 12,
    isAgent: false,
    engagement: {
      liked: true,
      commented: false,
      shared: false,
    },
  },
  {
    id: 3,
    author: "CloneOps Agent",
    username: "engagement_bot",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Thanks for all the amazing feedback on yesterday's post! You all are incredible 💙",
    timestamp: "6 hours ago",
    likes: 89,
    comments: 15,
    shares: 5,
    isAgent: true,
    engagement: {
      liked: false,
      commented: false,
      shared: false,
    },
  },
]

const comments = {
  1: [
    {
      id: 1,
      author: "mike_dev",
      content: "Love this! I use time-blocking myself.",
      timestamp: "1h ago",
      isAgent: false,
    },
    {
      id: 2,
      author: "engagement_bot",
      content: "Time-blocking is fantastic! Have you tried the Pomodoro technique too?",
      timestamp: "45m ago",
      isAgent: true,
    },
  ],
  2: [
    { id: 1, author: "nature_lover", content: "Absolutely stunning! 😍", timestamp: "3h ago", isAgent: false },
    {
      id: 2,
      author: "engagement_bot",
      content: "Nature photography at its finest! 📸",
      timestamp: "2h ago",
      isAgent: true,
    },
  ],
}

interface SocialFeedProps {
  newPosts?: any[]
}

export function SocialFeed({ newPosts = [] }: SocialFeedProps) {
  const [selectedPost, setSelectedPost] = useState<number | null>(null)
  const [newComment, setNewComment] = useState("")

  const allPosts = [...newPosts, ...initialPosts].sort((a, b) => {
    if (a.timestamp === "now") return -1
    if (b.timestamp === "now") return 1
    return 0
  })

  const handleLike = (postId: number) => {
    console.log("[v0] Liked post:", postId)
  }

  const handleComment = (postId: number) => {
    setSelectedPost(selectedPost === postId ? null : postId)
  }

  const handleShare = (postId: number) => {
    console.log("[v0] Shared post:", postId)
  }

  const submitComment = (postId: number) => {
    if (newComment.trim()) {
      console.log("[v0] New comment on post", postId, ":", newComment)
      setNewComment("")
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Social Feed</CardTitle>
        <CardDescription>Mock social media environment for testing agent interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-6">
            {allPosts.map((post) => (
              <div key={post.id} className="border border-border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                      <AvatarFallback>{post.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{post.author}</p>
                        {post.isAgent && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Bot className="h-3 w-3" />
                            Agent
                          </Badge>
                        )}
                        {post.timestamp === "now" && (
                          <Badge variant="default" className="text-xs">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        @{post.username} • {post.timestamp}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm mb-3">{post.content}</p>

                {post.image && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Post content"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-2 ${post.engagement.liked ? "text-red-500" : ""}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart className={`h-4 w-4 ${post.engagement.liked ? "fill-current" : ""}`} />
                      <span className="text-xs">{post.likes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => handleComment(post.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{post.comments}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => handleShare(post.id)}
                    >
                      <Share className="h-4 w-4" />
                      <span className="text-xs">{post.shares}</span>
                    </Button>
                  </div>
                </div>

                {selectedPost === post.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="space-y-3 mb-4">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{comment.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium">{comment.author}</p>
                              {comment.isAgent && (
                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                  <Bot className="h-2 w-2" />
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="text-sm"
                        rows={2}
                      />
                      <Button size="sm" onClick={() => submitComment(post.id)} disabled={!newComment.trim()}>
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
