"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, TrendingUp, ExternalLink, BookOpen } from "lucide-react"

const mockTrends = [
  {
    id: 1,
    topic: "AI Productivity Tools",
    volume: "High",
    growth: "+24%",
    related: ["automation", "workflow", "efficiency"],
  },
  {
    id: 2,
    topic: "Remote Work Setup",
    volume: "Medium",
    growth: "+12%",
    related: ["home office", "workspace", "productivity"],
  },
  {
    id: 3,
    topic: "Sustainable Living",
    volume: "High",
    growth: "+18%",
    related: ["eco-friendly", "green", "environment"],
  },
]

const mockArticles = [
  {
    id: 1,
    title: "The Future of AI in Content Creation",
    source: "TechCrunch",
    summary: "Exploring how AI tools are revolutionizing the way we create and distribute content...",
    url: "#",
    relevance: 95,
  },
  {
    id: 2,
    title: "Building Authentic Social Media Presence",
    source: "Social Media Today",
    summary: "Key strategies for maintaining authenticity while scaling your social media efforts...",
    url: "#",
    relevance: 88,
  },
  {
    id: 3,
    title: "Content Marketing Trends 2024",
    source: "Content Marketing Institute",
    summary: "Latest trends and predictions for content marketing in the coming year...",
    url: "#",
    relevance: 92,
  },
]

export function ContentResearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    // Simulate research API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSearchResults(mockArticles)
    setIsSearching(false)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Content Research
        </CardTitle>
        <CardDescription>Research trending topics and gather content inspiration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search for topics, trends, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending Topics
            </h4>
            <div className="space-y-2">
              {mockTrends.map((trend) => (
                <div key={trend.id} className="p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium">{trend.topic}</h5>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {trend.volume}
                      </Badge>
                      <span className="text-xs text-green-500">{trend.growth}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {trend.related.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {searchResults.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Research Results</h4>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {searchResults.map((article) => (
                    <div key={article.id} className="p-3 rounded-lg border border-border bg-muted/30">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium mb-1">{article.title}</h5>
                          <p className="text-xs text-muted-foreground mb-2">{article.summary}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {article.source}
                            </Badge>
                            <span className="text-xs text-muted-foreground">Relevance: {article.relevance}%</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
