"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export function UserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // In a real implementation, this would call an API endpoint
        // For now, we'll use mock data
        const mockProfile: UserProfile = {
          id: "user-123",
          username: "johndoe",
          email: "john@example.com",
          bio: "Digital creator and social media enthusiast. Love creating engaging content for my community!",
          avatar: "/placeholder.svg?height=100&width=100",
          socialLinks: {
            twitter: "@johndoe",
            instagram: "@johndoe",
            website: "https://johndoe.com"
          }
        };
        
        setUser(mockProfile);
        setFormData(mockProfile);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      // In a real implementation, this would call an API endpoint
      // await apiClient.updateUserProfile(formData);
      
      // Update local state
      if (user) {
        setUser({ ...user, ...formData });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Profile</CardTitle>
          <CardDescription>Loading profile...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Profile</CardTitle>
          <CardDescription>Error loading profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Failed to load profile</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Profile</CardTitle>
        <CardDescription>Manage your account settings and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{user.username}</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              {isEditing ? (
                <Input
                  id="username"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="py-2 px-3 bg-muted rounded-md">{user.username}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="py-2 px-3 bg-muted rounded-md">{user.email}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Input
                  id="bio"
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="py-2 px-3 bg-muted rounded-md min-h-[40px]">{user.bio}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              {isEditing ? (
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.socialLinks?.twitter || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      twitter: e.target.value
                    }
                  }))}
                />
              ) : (
                <p className="py-2 px-3 bg-muted rounded-md">{user.socialLinks?.twitter}</p>
              )}
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              {isEditing ? (
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.socialLinks?.instagram || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      instagram: e.target.value
                    }
                  }))}
                />
              ) : (
                <p className="py-2 px-3 bg-muted rounded-md">{user.socialLinks?.instagram}</p>
              )}
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              {isEditing ? (
                <Input
                  id="website"
                  name="website"
                  value={formData.socialLinks?.website || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      website: e.target.value
                    }
                  }))}
                />
              ) : (
                <p className="py-2 px-3 bg-muted rounded-md">{user.socialLinks?.website}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  setFormData(user);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
