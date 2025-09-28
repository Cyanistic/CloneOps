"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealtimeEvents } from "@/components/realtime-event-handler";
import { API } from "@/lib/api";
import { Post as ApiPost, UserContent } from "@/Api";
import { useSession } from "@/components/session-provider";
import { Image as ImageIcon, FileText, Video as VideoIcon, AudioWaveform } from "lucide-react";

interface PostWithMedia {
  id: string;
  caption: string;
  mediaContent: Array<{
    type: string;
    url?: string;
    format?: string;
    mimeType?: string;
  }>;
  timestamp: string;
  content: UserContent[];
}

export function PostHistory() {
  const [posts, setPosts] = useState<PostWithMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const { events, hasEventListeners } = useRealtimeEvents();
  const { user } = useSession();

  // Fetch posts when component mounts
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  // Handle real-time events for new posts
  useEffect(() => {
    if (!hasEventListeners) return;

    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      
      if (latestEvent.type === 'newPost') {
        // Add new post to the list when it's created
        const newPost = latestEvent.data as ApiPost;
        
        // Process the post to extract caption and media using the same logic as fetchPosts
        let caption = "";
        const mediaContent: Array<{
          type: string;
          url?: string;
          format?: string;
          mimeType?: string;
        }> = [];

        for (const content of newPost.content) {
          if (content.type === "text" && content.text) {
            caption = content.text;
          } else if (content.type === "image" && content.data) {
            // Handle both URL and base64 image data
            if (content.data.type === "url" || content.data.type === "base64") {
              mediaContent.push({
                type: "image",
                url: content.data.value,
                mimeType: content.media_type || undefined,
                format: content.data.type
              });
            }
          } else if (content.type === "document" && content.data) {
            // Handle both URL and base64 document data
            if (content.data.type === "url" || content.data.type === "base64") {
              mediaContent.push({
                type: "document",
                url: content.data.value,
                mimeType: content.media_type || undefined,
                format: content.data.type
              });
            }
          } else if (content.type === "audio" && content.data) {
            // Handle both URL and base64 audio data
            if (content.data.type === "url" || content.data.type === "base64") {
              mediaContent.push({
                type: "audio",
                url: content.data.value,
                mimeType: content.media_type || undefined,
                format: content.data.type
              });
            }
          } else if (content.type === "video" && content.data) {
            // Handle both URL and base64 video data
            if (content.data.type === "url" || content.data.type === "base64") {
              mediaContent.push({
                type: "video",
                url: content.data.value,
                mimeType: content.media_type || undefined,
                format: content.data.type
              });
            }
          }
        }

        const processedPost: PostWithMedia = {
          id: newPost.id,
          caption,
          mediaContent,
          timestamp: newPost.createdAt,
          content: newPost.content
        };

        setPosts(prev => [processedPost, ...prev]);
      }
    }
  }, [events, hasEventListeners]);

  const fetchPosts = async () => {
    if (!user) return;
    
    try {
      const response = await API.api.getPostsHandler(user.id);
      const rawPosts: ApiPost[] = response.data;

      // Process posts to extract captions and media from content
      const processedPosts = rawPosts.map(post => {
        let caption = "";
        const mediaContent: Array<{
          type: string;
          url?: string;
          format?: string;
          mimeType?: string;
        }> = [];

        for (const content of post.content) {
          if (content.type === "text" && content.text) {
            caption = content.text;
          } else if (content.type === "image" && content.data) {
            // Handle both URL and base64 image data
            if (content.data.type === "url" || content.data.type === "base64") {
              mediaContent.push({
                type: "image",
                url: content.data.value,
                mimeType: content.media_type || undefined,
                format: content.data.type
              });
            }
          } else if (content.type === "document" && content.data) {
            // Handle both URL and base64 document data
            if (content.data.type === "url" || content.data.type === "base64") {
              mediaContent.push({
                type: "document",
                url: content.data.value,
                mimeType: content.media_type || undefined,
                format: content.data.type
              });
            }
          } else if (content.type === "audio" && content.data) {
            // Handle both URL and base64 audio data
            if (content.data.type === "url" || content.data.type === "base64") {
              mediaContent.push({
                type: "audio",
                url: content.data.value,
                mimeType: content.media_type || undefined,
                format: content.data.type
              });
            }
          } else if (content.type === "video" && content.data) {
            // Handle both URL and base64 video data
            if (content.data.type === "url" || content.data.type === "base64") {
              mediaContent.push({
                type: "video",
                url: content.data.value,
                mimeType: content.media_type || undefined,
                format: content.data.type
              });
            }
          }
        }

        return {
          id: post.id,
          caption,
          mediaContent,
          timestamp: post.createdAt,
          content: post.content
        };
      });

      setPosts(processedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const allPosts = [...posts]; // Already sorted by fetchPosts to show newest first
  
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
        <CardDescription>Track all your posts</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="all">All Posts ({allPosts.length})</TabsTrigger>
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
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface PostPreviewProps {
  post: PostWithMedia;
}

function PostPreview({ post }: PostPreviewProps) {
  const date = new Date(post.timestamp);
  const formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderThumbnail = (mediaItem: { type: string; url?: string; format?: string }) => {
    if (!mediaItem.url) {
      return (
        <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
      );
    }

    // Determine if it's a base64 encoded string
    const isBase64 = mediaItem.format === 'base64' || mediaItem.url.startsWith('data:');
    
    // If it's base64 encoded, use the URL directly
    // If it's a URL format, also use the URL
    const mediaSrc = mediaItem.url;

    switch (mediaItem.type) {
      case "image":
        return (
          <div className="w-full h-40 relative">
            <img 
              src={mediaSrc} 
              alt="Post preview" 
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        );
      case "video":
        return (
          <div className="w-full h-40 relative bg-black rounded-md">
            <video 
              src={mediaSrc} 
              className="w-full h-full object-cover rounded-md"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoIcon className="h-12 w-12 text-white opacity-80" />
            </div>
          </div>
        );
      case "audio":
        return (
          <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center">
            <AudioWaveform className="h-8 w-8 text-muted-foreground" />
          </div>
        );
      case "document":
        return (
          <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        );
      default:
        return (
          <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        );
    }
  };

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-4">
        {post.mediaContent.length > 0 ? (
          <div className="mb-3">
            {renderThumbnail(post.mediaContent[0])}
          </div>
        ) : (
          <div className="mb-3 p-4 bg-muted rounded-md">
            <p className="text-sm line-clamp-4">{post.caption}</p>
          </div>
        )}
        
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
