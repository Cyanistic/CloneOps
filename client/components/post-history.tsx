"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api";
import { useRealtimeEvents } from "@/components/realtime-event-handler";

interface Post {
  id: string;
  caption: string;
  mediaUrl?: string;
  mediaType?: string; // image, video, etc.
  isAgentPost: boolean;
  timestamp: string;
  status?: string; // draft, scheduled, published
}

export function PostHistory() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { events } = useRealtimeEvents();

  // Fetch posts when component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // In a real implementation, this would fetch from the API
        // For now, we'll start with an empty array
        const initialPosts: Post[] = [];
        
        setPosts(initialPosts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle real-time events for new posts
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      
      // Handle new message events which would include posts in a real implementation
      if (latestEvent.type === 'newMessage' && latestEvent.data) {
        // In a real implementation, posts might be handled differently
        // For now, this is just a placeholder
        console.log('New message event received:', latestEvent.data);
      }
    }
  }, [events]);

  const allPosts = [...posts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  const agentPosts = posts
    .filter(post => post.isAgentPost)
    .sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  
  const personalPosts = posts
    .filter(post => !post.isAgentPost)
    .sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Post History</CardTitle>
          <CardDescription>Loading your post history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading posts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Post History</CardTitle>
        <CardDescription>Track all your posts - agent-created or personal</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Posts ({allPosts.length})</TabsTrigger>
            <TabsTrigger value="agent">Agent Posts ({agentPosts.length})</TabsTrigger>
            <TabsTrigger value="personal">Personal Posts ({personalPosts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPosts.map((post) => (
                <PostPreview key={post.id} post={post} />
              ))}
              {allPosts.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No posts yet. Create your first post using the composer!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="agent" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentPosts.map((post) => (
                <PostPreview key={post.id} post={post} />
              ))}
              {agentPosts.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No agent posts yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="personal" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalPosts.map((post) => (
                <PostPreview key={post.id} post={post} />
              ))}
              {personalPosts.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No personal posts yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface PostPreviewProps {
  post: Post;
}

function PostPreview({ post }: PostPreviewProps) {
  const date = new Date(post.timestamp);
  const formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-4">
        {post.mediaUrl ? (
          <div className="mb-3">
            {post.mediaType === 'image' ? (
              <img 
                src={post.mediaUrl} 
                alt="Post preview" 
                className="w-full h-40 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center">
                <span className="text-muted-foreground">Video Preview</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-3 p-4 bg-muted rounded-md">
            <p className="text-sm line-clamp-4">{post.caption}</p>
          </div>
        )}
        
        <div className="flex justify-between items-start">
          <div>
            <Badge variant={post.isAgentPost ? "default" : "secondary"} className="mb-2">
              {post.isAgentPost ? "Agent Post" : "Personal"}
            </Badge>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}