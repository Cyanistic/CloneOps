"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Shield, User } from "lucide-react"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("cloneops-users")
    if (stored) {
      setRegisteredUsers(JSON.parse(stored))
    }
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.target as HTMLFormElement)
    const username = formData.get("username") as string

    // Check if username exists
    if (!registeredUsers.includes(username.toLowerCase())) {
      setError("Username not found. Please sign up first.")
      setIsLoading(false)
      return
    }

    // Simulate authentication
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Store current user
    localStorage.setItem("cloneops-current-user", username)
    setIsLoading(false)

    // Redirect to dashboard
    window.location.href = "/dashboard"
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.target as HTMLFormElement)
    const username = formData.get("signup-username") as string
    const password = formData.get("signup-password") as string
    const confirmPassword = formData.get("confirm-password") as string

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Check if username already exists
    if (registeredUsers.includes(username.toLowerCase())) {
      setError("Username already exists. Please choose a different one.")
      setIsLoading(false)
      return
    }

    // Simulate account creation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Add username to registered users
    const updatedUsers = [...registeredUsers, username.toLowerCase()]
    setRegisteredUsers(updatedUsers)
    localStorage.setItem("cloneops-users", JSON.stringify(updatedUsers))
    localStorage.setItem("cloneops-current-user", username)

    setIsLoading(false)

    // Redirect to dashboard
    window.location.href = "/dashboard"
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">Sign in to your CloneOps account</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    required
                    className="bg-input border-border pl-10"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className="bg-input border-border pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              {error && (
                <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md p-2">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-username">Username</Label>
                <div className="relative">
                  <Input
                    id="signup-username"
                    name="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    required
                    className="bg-input border-border pl-10"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    name="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    required
                    className="bg-input border-border pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  className="bg-input border-border"
                />
              </div>
              {error && (
                <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md p-2">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex items-center justify-center text-sm text-muted-foreground">
          <Shield className="h-4 w-4 mr-2" />
          <span>Secured with enterprise-grade encryption</span>
        </div>

        {registeredUsers.length > 0 && (
          <div className="mt-4 text-center text-xs text-muted-foreground">
            {registeredUsers.length} user{registeredUsers.length !== 1 ? "s" : ""} registered
          </div>
        )}
      </CardContent>
    </Card>
  )
}
