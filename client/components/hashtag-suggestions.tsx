"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Hash, Copy, TrendingUp, Target } from "lucide-react"

const hashtagCategories = {
  trending: [
    { tag: "productivity", volume: "2.1M", difficulty: "High" },
    { tag: "workfromhome", volume: "890K", difficulty: "Medium" },
    { tag: "motivation", volume: "1.5M", difficulty: "High" },
    { tag: "entrepreneur", volume: "3.2M", difficulty: "High" },
  ],
  niche: [
    { tag: "solopreneur", volume: "156K", difficulty: "Low" },
    { tag: "productivityhacks", volume: "89K", difficulty: "Low" },
    { tag: "workspacegoals", volume: "234K", difficulty: "Medium" },
    { tag: "digitalminimalism", volume: "67K", difficulty: "Low" },
  ],
  branded: [
    { tag: "cloneops", volume: "1.2K", difficulty: "Low" },
    { tag: "aiautomation", volume: "45K", difficulty: "Medium" },
    { tag: "socialmediatools", volume: "123K", difficulty: "Medium" },
    { tag: "contentcreation", volume: "567K", difficulty: "High" },
  ],
}

export function HashtagSuggestions() {
  const [keyword, setKeyword] = useState("")
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])

  const addHashtag = (hashtag: string) => {
    if (!selectedHashtags.includes(hashtag)) {
      setSelectedHashtags([...selectedHashtags, hashtag])
    }
  }

  const removeHashtag = (hashtag: string) => {
    setSelectedHashtags(selectedHashtags.filter((h) => h !== hashtag))
  }

  const copyHashtags = () => {
    const hashtagString = selectedHashtags.map((h) => `#${h}`).join(" ")
    navigator.clipboard.writeText(hashtagString)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Low":
        return "text-green-500"
      case "Medium":
        return "text-yellow-500"
      case "High":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Hashtag Suggestions
        </CardTitle>
        <CardDescription>Discover relevant hashtags to boost your content reach</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="keyword">Content Keyword</Label>
          <Input
            id="keyword"
            placeholder="Enter a keyword related to your content..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending Hashtags
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {hashtagCategories.trending.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded border border-border bg-muted/20 cursor-pointer hover:bg-muted/40"
                  onClick={() => addHashtag(item.tag)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{item.tag}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.volume}
                    </Badge>
                  </div>
                  <span className={`text-xs ${getDifficultyColor(item.difficulty)}`}>{item.difficulty}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Niche Hashtags
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {hashtagCategories.niche.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded border border-border bg-muted/20 cursor-pointer hover:bg-muted/40"
                  onClick={() => addHashtag(item.tag)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{item.tag}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.volume}
                    </Badge>
                  </div>
                  <span className={`text-xs ${getDifficultyColor(item.difficulty)}`}>{item.difficulty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedHashtags.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Selected Hashtags ({selectedHashtags.length})</h4>
              <Button variant="outline" size="sm" onClick={copyHashtags}>
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedHashtags.map((hashtag) => (
                <Badge
                  key={hashtag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeHashtag(hashtag)}
                >
                  #{hashtag} ×
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
