"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/session-provider";
import { API } from "@/lib/api";
import { Post as ApiPost, UserContent, Image, Document, Audio, Video } from "@/Api";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  FileText,
  VideoIcon,
  AudioWaveform,
  Calendar,
  Eye,
  FileImage,
  FileVideo,
  FileAudio
} from "lucide-react";

interface PostWithMedia {
  id: string;
  caption: string;
  mediaContent: Array<{
    type: string;
    url?: string;
    format?: string;
    mimeType?: string;
  }>;
  createdAt: string;
  content: UserContent[];
}

export default function ProfilePage() {
  const { user } = useSession();
  const [userPosts, setUserPosts] = useState<PostWithMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostWithMedia | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
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
          createdAt: post.createdAt,
          content: post.content
        };
      });

      setUserPosts(processedPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: PostWithMedia) => {
    setSelectedPost(post);
    setDialogOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) {
      alert("You must be logged in to delete a post.");
      return;
    }

    try {
      await API.api.deletePostHandler(postId);
      // Close the dialog and refresh posts
      setDialogOpen(false);
      setSelectedPost(null);
      // Refresh the posts list
      fetchUserPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error deleting post. Please try again.");
    }
  };

  const renderMediaContent = (mediaItem: { type: string; url?: string; format?: string; mimeType?: string }) => {
    if (!mediaItem.url) return null;

    // Determine if it's a base64 encoded string
    const isBase64 = mediaItem.format === 'base64' || mediaItem.url.startsWith('data:');
    
    // If it's base64 encoded, use the URL directly
    // If it's a URL format, also use the URL
    const mediaSrc = mediaItem.url;

    switch (mediaItem.type) {
      case "image":
        return (
          <div className="w-full">
            <img
              src={mediaSrc}
              alt="Post media"
              className="w-full h-auto max-h-[50vh] object-contain rounded-md"
            />
          </div>
        );
      case "video":
        return (
          <div className="w-full aspect-video bg-black rounded-md overflow-hidden">
            <video 
              src={mediaSrc} 
              controls 
              className="w-full h-full"
            />
          </div>
        );
      case "audio":
        return (
          <div className="w-full bg-muted rounded-md p-4">
            <div className="flex items-center gap-3">
              <AudioWaveform className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium">Audio File</p>
                <audio src={mediaSrc} controls className="w-full mt-2" />
              </div>
            </div>
          </div>
        );
      case "document":
        return (
          <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Document</p>
          </div>
        );
      default:
        return (
          <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Media Content</p>
          </div>
        );
    }
  };

  const renderThumbnail = (mediaItem: { type: string; url?: string; format?: string }) => {
    if (!mediaItem.url) {
      return (
        <div className="aspect-square w-full bg-muted flex items-center justify-center">
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
          <div className="aspect-square w-full relative">
            <img
              src={mediaSrc}
              alt="Post media"
              className="w-full h-full object-cover"
            />
          </div>
        );
      case "video":
        return (
          <div className="aspect-square w-full relative bg-black">
            <video 
              src={mediaSrc} 
              className="w-full h-full object-cover"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoIcon className="h-12 w-12 text-white opacity-80" />
            </div>
          </div>
        );
      case "audio":
        return (
          <div className="aspect-square w-full bg-muted flex items-center justify-center">
            <AudioWaveform className="h-8 w-8 text-muted-foreground" />
          </div>
        );
      case "document":
        return (
          <div className="aspect-square w-full bg-muted flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        );
      default:
        return (
          <div className="aspect-square w-full bg-muted flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Please log in</h1>
          <p className="text-muted-foreground mt-2">You need to be logged in to view your profile</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border rounded-lg p-4 h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xl font-bold">
                {user.username?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user.username}</h1>
              <p className="text-muted-foreground">Your social media activity</p>
            </div>
          </div>
          
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold">{userPosts.length}</p>
              <p className="text-muted-foreground">Posts</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Your Posts</h2>
          
          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">No posts yet</h3>
              <p className="text-muted-foreground mt-2">Create your first post using the social media section</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handlePostClick(post)}
                >
                  {post.mediaContent.length > 0 ? (
                    <div className="relative">
                      {renderThumbnail(post.mediaContent[0])}
                    </div>
                  ) : (
                    <CardContent className="p-4">
                      <p className="text-sm line-clamp-4">{post.caption}</p>
                    </CardContent>
                  )}
                  
                  <CardHeader className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge variant="secondary" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4">
              {selectedPost.mediaContent.length > 0 ? (
                <div className="space-y-4">
                  {selectedPost.mediaContent.map((mediaItem, index) => (
                    <div key={index}>
                      {renderMediaContent(mediaItem)}
                    </div>
                  ))}
                </div>
              ) : null}
              
              {selectedPost.caption && (
                <div className="prose max-w-none">
                  <p className="text-foreground whitespace-pre-line">{selectedPost.caption}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t">
                <Badge variant="secondary">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(selectedPost.createdAt).toLocaleString()}
                </Badge>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
                      handleDeletePost(selectedPost.id);
                    }
                  }}
                >
                  Delete Post
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}