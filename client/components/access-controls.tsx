"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Users, UserCheck, UserX, Settings, Crown, UserPlus, Search, Trash2, ShieldAlert, LogIn } from "lucide-react"
import { API } from "@/lib/api"
import { useSession } from "@/components/session-provider"
import { useRouter } from "next/navigation"

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

// Context for managing the currently active account
interface AccountContextType {
  activeAccount: User | null;
  mainAccount: User | null;
  isManagingOtherAccount: boolean;
  setActiveAccount: (user: User | null) => void;
  delegateToAccount: (user: User) => void;
  returnToMainAccount: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [activeAccount, setActiveAccount] = useState<User | null>(null);
  const session = useSession();

  const mainAccount = session.user;

  const delegateToAccount = (user: User) => {
    setActiveAccount(user);
  };

  const returnToMainAccount = () => {
    setActiveAccount(mainAccount || null);
  };

  useEffect(() => {
    // Initialize with main account
    setActiveAccount(mainAccount || null);
  }, [mainAccount]);

  const isManagingOtherAccount = activeAccount?.id !== mainAccount?.id;

  return (
    <AccountContext.Provider value={{ 
      activeAccount, 
      mainAccount,
      isManagingOtherAccount,
      setActiveAccount, 
      delegateToAccount, 
      returnToMainAccount 
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}

export function AccessControls() {
  const { user } = useSession();
  const { delegateToAccount } = useAccount();
  const router = useRouter();
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [receivedDelegations, setReceivedDelegations] = useState<Delegation[]>([]);
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
  const [isLoadingReceivedDelegations, setIsLoadingReceivedDelegations] = useState(true);
  const [activeTab, setActiveTab] = useState<'grant' | 'manage'>('grant'); // 'grant' for granting permissions, 'manage' for managing delegated accounts

  // State to store user details for display
  const [userDetails, setUserDetails] = useState<Record<string, User>>({});

  // Load delegations on component mount
  useEffect(() => {
    if (user) {
      loadDelegations();
      loadReceivedDelegations();
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

  const loadReceivedDelegations = async () => {
    try {
      setIsLoadingReceivedDelegations(true);
      const response = await API.api.getReceivedDelegationsHandler();
      setReceivedDelegations(response.data);
    } catch (error) {
      console.error("Error loading received delegations:", error);
    } finally {
      setIsLoadingReceivedDelegations(false);
    }
  };

  // Function to fetch and cache user details
  const fetchUserDetails = async (userIds: string[]) => {
    const newDetails = { ...userDetails };
    const userIdsToFetch = userIds.filter(id => !newDetails[id]);

    if (userIdsToFetch.length === 0) return;

    for (const userId of userIdsToFetch) {
      try {
        const response = await API.api.getUserHandler(userId);
        newDetails[userId] = response.data;
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        newDetails[userId] = {
          id: userId,
          username: "Unknown User",
          createdAt: "",
          updatedAt: ""
        };
      }
    }

    setUserDetails(newDetails);
  };

  // Fetch user details when delegations change
  useEffect(() => {
    const allUserIds = [
      ...delegations.map(d => d.delegateId),
      ...receivedDelegations.map(d => d.ownerId)
    ];
    if (allUserIds.length > 0) {
      fetchUserDetails(allUserIds);
    }
  }, [delegations, receivedDelegations]);

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

  // Update search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleNukeAllPermissions = async () => {
    if (!window.confirm("Are you sure you want to revoke ALL delegations? This will remove access for all users you've granted permissions to.")) {
      return;
    }

    try {
      setIsLoading(true);
      // Revoke all delegations
      for (const delegation of delegations) {
        await API.api.revokeDelegationHandler(delegation.delegateId);
      }
      // Refresh delegations after successful nuke
      await loadDelegations();
    } catch (error) {
      console.error("Error nuking permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-border">
          <button
            className={`pb-2 px-3 text-sm font-medium ${
              activeTab === 'grant' 
                ? 'border-b-2 border-foreground text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('grant')}
          >
            Grant Permissions
          </button>
          <button
            className={`pb-2 px-3 text-sm font-medium ${
              activeTab === 'manage' 
                ? 'border-b-2 border-foreground text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Delegated Access
          </button>
        </div>

        {/* Grant Permissions Tab */}
        {activeTab === 'grant' && (
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
              
              <div className="space-y-4">
                <h5 className="text-sm font-medium">Permissions</h5>
                <div className="space-y-3 p-3 bg-muted/20 rounded-lg">
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

            {/* Current Delegations */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Current Delegations</h4>
                <div className="flex space-x-2">
                  <span className="text-xs text-muted-foreground">{delegations.length} granted</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNukeAllPermissions}
                    className="text-destructive hover:text-destructive"
                    disabled={isLoading || delegations.length === 0}
                  >
                    <ShieldAlert className="h-4 w-4 mr-1" />
                    Nuke All
                  </Button>
                </div>
              </div>
              
              {delegations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No delegations found</p>
              ) : (
                <div className="space-y-2">
                  {delegations.map((delegation) => {
                    const userDetail = userDetails[delegation.delegateId] || {
                      id: delegation.delegateId,
                      username: "Unknown User",
                      createdAt: "",
                      updatedAt: ""
                    };
                    
                    return (
                      <div
                        key={`${delegation.ownerId}-${delegation.delegateId}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {userDetail.username
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">
                                {userDetail.username}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {delegation.canPost && (
                                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Post</span>
                              )}
                              {delegation.canMessage && (
                                <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">Message</span>
                              )}
                              {delegation.canDeletePosts && (
                                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded">Delete</span>
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
          </div>
        )}

        {/* Manage Delegated Access Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Accounts You Manage</h4>
            
            {receivedDelegations.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No accounts have been delegated to you</p>
              </div>
            ) : (
              <div className="space-y-2">
                {receivedDelegations.map((delegation) => {
                  const ownerDetail = userDetails[delegation.ownerId] || {
                    id: delegation.ownerId,
                    username: "Unknown User",
                    createdAt: "",
                    updatedAt: ""
                  };
                  
                  return (
                    <div
                      key={`${delegation.ownerId}-${delegation.delegateId}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {ownerDetail.username
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {ownerDetail.username}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {delegation.canPost && (
                              <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Post</span>
                            )}
                            {delegation.canMessage && (
                              <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">Message</span>
                            )}
                            {delegation.canDeletePosts && (
                              <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded">Delete</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Update the context to indicate we're now managing this account
                          delegateToAccount(ownerDetail);
                          
                          // Redirect to the user's profile page to manage their account
                          router.push(`/profile/${ownerDetail.id}`);
                        }}
                      >
                        <LogIn className="h-4 w-4 mr-1" />
                        Access
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}