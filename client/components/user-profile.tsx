"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Grid, List, Bot, Heart, MessageCircle, Share } from "lucide-react"

const getLoggedInUser = () => {
  if (typeof window !== "undefined") {
    console.log("[v0] Checking localStorage for username...")
    // Try the main key used by dashboard-header first, then fallback to the old key for consistency
    const username = localStorage.getItem("cloneops-current-user") || localStorage.getItem("cloneops_username")
    console.log("[v0] Found username:", username)
    if (username) {
      const user = {
        id: `user_${username}`,
        name: username.charAt(0).toUpperCase() + username.slice(1), // Capitalize first letter
        username: username,
        avatar: `/placeholder.svg?height=120&width=120`,
        bio: `Content creator using CloneOps AI agents 🤖`,
        followers: Math.floor(Math.random() * 2000) + 500, // Random followers for demo
        following: Math.floor(Math.random() * 1000) + 200, // Random following for demo
        posts: 0, // Will be calculated dynamically
        verified: false,
      }
      console.log("[v0] Created user object:", user)
      return user
    } else {
      console.log("[v0] No username found in localStorage")
    }
  } else {
    console.log("[v0] Window is undefined (SSR)")
  }
  return null
}

// Filter posts to show only user's posts (including agent posts they created)
const staticUserPosts = [
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
    createdBy: "user_1", // This indicates which user created this agent post
  },
  {
    id: 4,
    author: "Alex Thompson",
    username: "alex_thompson",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Working on some exciting new features for CloneOps! Can't wait to share what we've been building 🚀",
    image: "/coding-workspace.png",
    timestamp: "1 day ago",
    likes: 89,
    comments: 12,
    shares: 7,
    isAgent: false,
    createdBy: "user_1",
  },
  {
    id: 5,
    author: "CloneOps Agent",
    username: "engagement_bot",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Thanks for all the amazing feedback on yesterday's post! You all are incredible 💙",
    timestamp: "2 days ago",
    likes: 156,
    comments: 23,
    shares: 12,
    isAgent: true,
    createdBy: "user_1",
  },
  {
    id: 6,
    author: "Alex Thompson",
    username: "alex_thompson",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Beautiful morning for a coffee and some coding ☕️ What's everyone working on today?",
    image: "/coffee-and-laptop.jpg",
    timestamp: "3 days ago",
    likes: 67,
    comments: 18,
    shares: 4,
    isAgent: false,
    createdBy: "user_1",
  },
  {
    id: 7,
    author: "Alex Thompson",
    username: "alex_thompson",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "Just launched my first AI agent! It's incredible how much time this saves on social media management 🤖✨",
    timestamp: "1 week ago",
    likes: 234,
    comments: 45,
    shares: 28,
    isAgent: false,
    createdBy: "user_1",
  },
  {
    id: 8,
    author: "CloneOps Agent",
    username: "content_poster",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Monday motivation: Every expert was once a beginner. Keep pushing forward! 💪",
    image: "/motivational-workspace.jpg",
    timestamp: "1 week ago",
    likes: 178,
    comments: 32,
    shares: 19,
    isAgent: true,
    createdBy: "user_1",
  },
]

interface UserProfileProps {
  newPosts?: any[]
}

export function UserProfile({ newPosts = [] }: UserProfileProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] UserProfile useEffect running...")
    const loadUser = () => {
      try {
        const user = getLoggedInUser()
        console.log("[v0] Loaded user:", user)
        setCurrentUser(user)
      } catch (error) {
        console.error("[v0] Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(loadUser, 100)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">No user logged in</p>
                <p className="text-sm text-muted-foreground">Please log in to view your profile</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userPosts = [
    ...newPosts.filter(
      (post) => post.username === currentUser.username || (!post.isAgent && post.author === currentUser.name),
    ),
    ...staticUserPosts.filter((post) => post.createdBy === currentUser.id),
  ].sort((a, b) => {
    if (a.timestamp === "now") return -1
    if (b.timestamp === "now") return 1
    return 0
  })

  const totalPosts = userPosts.length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                <AvatarFallback className="text-2xl">{currentUser.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="outline" className="w-full md:w-auto bg-transparent">
                Edit Profile
              </Button>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{currentUser.name}</h1>
                  {currentUser.verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">@{currentUser.username}</p>
              </div>

              <p className="text-sm">{currentUser.bio}</p>

              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-semibold">{totalPosts}</span>
                  <span className="text-muted-foreground ml-1">posts</span>
                </div>
                <div>
                  <span className="font-semibold">{currentUser.followers.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">followers</span>
                </div>
                <div>
                  <span className="font-semibold">{currentUser.following}</span>
                  <span className="text-muted-foreground ml-1">following</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Section */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Posts</CardTitle>
              <CardDescription>Posts created by you and your agents</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="agents">Agent Posts</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {userPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No posts yet. Create your first post!</p>
                </div>
              ) : (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userPosts.map((post) => (
                        <div key={post.id} className="group cursor-pointer">
                          <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                            {post.image ? (
                              <img
                                src={post.image || "/placeholder.svg"}
                                alt="Post content"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <p className="text-sm text-center p-4 line-clamp-4">{post.content}</p>
                              </div>
                            )}

                            {/* Overlay with engagement stats */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <div className="flex items-center gap-4 text-white text-sm">
                                <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4 fill-current" />
                                  {post.likes}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4 fill-current" />
                                  {post.comments}
                                </div>
                              </div>
                            </div>

                            {/* Agent badge */}
                            {post.isAgent && (
                              <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                  <Bot className="h-3 w-3" />
                                  Agent
                                </Badge>
                              </div>
                            )}

                            {post.timestamp === "now" && (
                              <div className="absolute top-2 left-2">
                                <Badge variant="default" className="text-xs">
                                  NEW
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userPosts.map((post) => (
                        <div key={post.id} className="border border-border rounded-lg p-4 bg-muted/20">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                              <AvatarFallback>{post.author[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
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
                              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                            </div>
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

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.likes}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {post.comments}
                            </div>
                            <div className="flex items-center gap-1">
                              <Share className="h-4 w-4" />
                              {post.shares}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="personal" className="mt-6">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userPosts
                    .filter((post) => !post.isAgent)
                    .map((post) => (
                      <div key={post.id} className="group cursor-pointer">
                        <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                          {post.image ? (
                            <img
                              src={post.image || "/placeholder.svg"}
                              alt="Post content"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <p className="text-sm text-center p-4 line-clamp-4">{post.content}</p>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <div className="flex items-center gap-4 text-white text-sm">
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4 fill-current" />
                                {post.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4 fill-current" />
                                {post.comments}
                              </div>
                            </div>
                          </div>

                          {post.timestamp === "now" && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="default" className="text-xs">
                                NEW
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts
                    .filter((post) => !post.isAgent)
                    .map((post) => (
                      <div key={post.id} className="border border-border rounded-lg p-4 bg-muted/20">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                            <AvatarFallback>{post.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{post.author}</p>
                              {post.timestamp === "now" && (
                                <Badge variant="default" className="text-xs">
                                  NEW
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                          </div>
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

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.comments}
                          </div>
                          <div className="flex items-center gap-1">
                            <Share className="h-4 w-4" />
                            {post.shares}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="agents" className="mt-6">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userPosts
                    .filter((post) => post.isAgent)
                    .map((post) => (
                      <div key={post.id} className="group cursor-pointer">
                        <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                          {post.image ? (
                            <img
                              src={post.image || "/placeholder.svg"}
                              alt="Post content"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <p className="text-sm text-center p-4 line-clamp-4">{post.content}</p>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <div className="flex items-center gap-4 text-white text-sm">
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4 fill-current" />
                                {post.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4 fill-current" />
                                {post.comments}
                              </div>
                            </div>
                          </div>

                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Bot className="h-3 w-3" />
                              Agent
                            </Badge>
                          </div>

                          {post.timestamp === "now" && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="default" className="text-xs">
                                NEW
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts
                    .filter((post) => post.isAgent)
                    .map((post) => (
                      <div key={post.id} className="border border-border rounded-lg p-4 bg-muted/20">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                            <AvatarFallback>{post.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{post.author}</p>
                              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                <Bot className="h-3 w-3" />
                                Agent
                              </Badge>
                              {post.timestamp === "now" && (
                                <Badge variant="default" className="text-xs">
                                  NEW
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                          </div>
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

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.comments}
                          </div>
                          <div className="flex items-center gap-1">
                            <Share className="h-4 w-4" />
                            {post.shares}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
