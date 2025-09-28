"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Users, UserCheck, UserX, Settings, Crown, UserPlus, Search, Trash2 } from "lucide-react"
import { API } from "@/lib/api"
import { useSession } from "@/components/session-provider"

interface User {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

interface Delegation {
  ownerId: string;
  delegateId: string;
  canPost: boolean;
  canMessage: boolean;
  canDeletePosts: boolean;
  createdAt: string;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "Admin":
      return <Crown className="h-4 w-4 text-yellow-500" />
    case "Editor":
      return <UserCheck className="h-4 w-4 text-blue-500" />
    case "Guest":
      return <UserX className="h-4 w-4 text-gray-500" />
    default:
      return <Users className="h-4 w-4" />
  }
}

export function AccessControls() {
  const { user } = useSession();
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState({
    canPost: false,
    canMessage: false,
    canDeletePosts: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDelegations, setIsLoadingDelegations] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // Load delegations on component mount
  useEffect(() => {
    if (user) {
      loadDelegations();
    }
  }, [user]);

  const loadDelegations = async () => {
    try {
      setIsLoadingDelegations(true);
      const response = await API.api.getDelegationsHandler();
      setDelegations(response.data);
    } catch (error) {
      console.error("Error loading delegations:", error);
    } finally {
      setIsLoadingDelegations(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoadingSearch(true);
      const response = await API.api.searchUsersHandler({ q: searchQuery });
      // Filter out current user from results
      const filteredUsers = response.data.filter(responseUser => responseUser.id !== user?.id);
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchQuery(user.username);
    // Reset permissions when selecting a new user
    setPermissions({
      canPost: false,
      canMessage: false,
      canDeletePosts: false,
    });
  };

  const handlePermissionChange = (permission: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const handleGrantAccess = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      const payload = {
        delegateId: selectedUser.id,
        canPost: permissions.canPost,
        canMessage: permissions.canMessage,
        canDeletePosts: permissions.canDeletePosts,
      };

      await API.api.createDelegationHandler(payload);
      
      // Refresh delegations after successful creation
      await loadDelegations();
      
      // Reset form
      setSelectedUser(null);
      setSearchQuery("");
      setPermissions({
        canPost: false,
        canMessage: false,
        canDeletePosts: false,
      });
    } catch (error) {
      console.error("Error creating delegation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAccess = async (delegateId: string) => {
    try {
      await API.api.revokeDelegationHandler(delegateId);
      // Refresh delegations after successful revocation
      await loadDelegations();
    } catch (error) {
      console.error("Error revoking delegation:", error);
    }
  };

  const getDelegatedUser = (delegateId: string) => {
    return searchResults.find(user => user.id === delegateId) || {
      id: delegateId,
      username: "Unknown User",
      createdAt: "",
      updatedAt: ""
    };
  };

  // Update search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Access Controls
        </CardTitle>
        <CardDescription>Manage user permissions and access levels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grant Access Form */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Grant Access</h4>
          
          <div className="space-y-3">
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for a user by username"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                
                {/* User search results dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map(user => (
                      <div
                        key={user.id}
                        className="p-2 hover:bg-accent cursor-pointer flex items-center gap-2"
                        onClick={() => handleSelectUser(user)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.username
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{user.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {selectedUser && (
              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {selectedUser.username
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedUser.username}</p>
                    <p className="text-xs text-muted-foreground">Selected for delegation</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Post Creation</Label>
                  <p className="text-xs text-muted-foreground">Allow user to create posts on your behalf</p>
                </div>
                <Switch 
                  checked={permissions.canPost} 
                  onCheckedChange={() => handlePermissionChange('canPost')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Messaging</Label>
                  <p className="text-xs text-muted-foreground">Allow user to send messages for you</p>
                </div>
                <Switch 
                  checked={permissions.canMessage} 
                  onCheckedChange={() => handlePermissionChange('canMessage')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Post Deletion</Label>
                  <p className="text-xs text-muted-foreground">Allow user to delete your posts</p>
                </div>
                <Switch 
                  checked={permissions.canDeletePosts} 
                  onCheckedChange={() => handlePermissionChange('canDeletePosts')}
                />
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleGrantAccess} 
              disabled={!selectedUser || isLoading}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isLoading ? "Processing..." : "Grant Access"}
            </Button>
          </div>
        </div>

        {/* Delegated Access List */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Current Delegations</h4>
            {isLoadingDelegations && <span className="text-xs text-muted-foreground">Loading...</span>}
          </div>
          
          {delegations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No delegations found</p>
          ) : (
            <div className="space-y-2">
              {delegations.map((delegation) => {
                const user = getDelegatedUser(delegation.delegateId);
                return (
                  <div
                    key={`${delegation.ownerId}-${delegation.delegateId}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{user.username}</p>
                        </div>
                        <div className="flex gap-2 mt-1">
                          {delegation.canPost && (
                            <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">Post</span>
                          )}
                          {delegation.canMessage && (
                            <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded">Message</span>
                          )}
                          {delegation.canDeletePosts && (
                            <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">Delete</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRevokeAccess(delegation.delegateId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
