"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { UserContent } from "@/Api";

export function PostComposer() {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { user } = useSession();

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      // Create a preview URL for the selected file
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePostSubmit = async () => {
    if (!user) {
      alert("You must be logged in to create a post.");
      return;
    }

    if (!caption.trim() && !media) {
      alert("Please provide a caption or media for your post.");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare content based on caption and media
      const content: UserContent[] = [];
      
      if (caption.trim()) {
        content.push({
          type: "text",
          text: caption
        });
      }

      // Handle media upload as base64 string
      if (media) {
        // Convert file to base64 for storage in the database
        const base64Data = await fileToBase64(media);
        
        if (media.type.startsWith('image/')) {
          const imageContent: any = {
            type: "image",
            data: {
              type: "base64",
              value: base64Data
            },
            detail: null, // Image detail is optional
            media_type: media.type.split('/')[1] || null // Use null if not available
          };
          content.push(imageContent);
        }
        // For documents like PDFs
        else {
          const documentContent: any = {
            type: "document",
            data: {
              type: "base64",
              value: base64Data
            },
            media_type: media.type.split('/')[1] || null,
            format: null // Format is optional
          };
          content.push(documentContent);
        }
      }

      // Create the post via API
      const response = await API.api.createPostHandler({
        content
      });

      console.log("Post created successfully:", response.data);
      
      // Reset form after successful post
      setCaption("");
      setMedia(null);
      setPreviewUrl(null);
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl); // Clean up object URL
      }
      
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
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx" 
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
                <span className="text-muted-foreground">
                  {media?.type.startsWith('video/') ? 'Video Preview' : 
                   media?.type.startsWith('audio/') ? 'Audio Preview' : 
                   'Document Preview'}
                </span>
              </div>
            )}
          </div>
        )}
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
