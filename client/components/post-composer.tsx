"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function PostComposer() {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [isAgentPost, setIsAgentPost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      // Create a preview URL for the selected file
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handlePostSubmit = async () => {
    setIsLoading(true);
    try {
      // Create a mock post object to add to history
      const newPost = {
        id: `post-${Date.now()}`,
        caption,
        isAgentPost,
        timestamp: new Date().toISOString(),
        status: "published",
        mediaUrl: media ? URL.createObjectURL(media) : undefined,
        mediaType: media ? media.type.startsWith('image/') ? 'image' : 'video' : undefined
      };

      // In a real implementation, this would send to the API
      // For now, we'll just log the post data and return the mock post
      console.log("Posting with data:", {
        caption,
        isAgentPost,
        media: media ? media.name : null
      });

      // Example API call:
      // const response = await apiClient.createPost({
      //   caption,
      //   isAgentPost,
      //   // Additional fields as needed
      // });
      
      // Instead of showing an alert, we could broadcast a new post event
      // But for now, let's just log success
      console.log("Post created successfully!");
      
      // Reset form after successful post
      setCaption("");
      setMedia(null);
      setIsAgentPost(false);
      setPreviewUrl(null);
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl); // Clean up object URL
      }
      
      // In a real implementation, we'd use the response data
      // For now, we're using the mock post object
      alert("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Compose Post</CardTitle>
        <CardDescription>Create a new post for your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="caption">Caption</Label>
          <Textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your caption here..."
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="media">Media</Label>
          <Input 
            id="media" 
            type="file" 
            accept="image/*,video/*" 
            onChange={handleMediaChange}
          />
        </div>

        {previewUrl && (
          <div className="mt-2">
            {media?.type.startsWith('image/') ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-48 object-contain rounded-md border border-border"
              />
            ) : (
              <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center border border-border">
                <span className="text-muted-foreground">Video Preview</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="use-agent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Post with Agent
          </Label>
          <Switch
            id="use-agent"
            checked={isAgentPost}
            onCheckedChange={setIsAgentPost}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handlePostSubmit} 
          disabled={isLoading || (!caption.trim() && !media)}
          className="w-full"
        >
          {isLoading ? "Posting..." : "Post"}
        </Button>
      </CardFooter>
    </Card>
  );
}
