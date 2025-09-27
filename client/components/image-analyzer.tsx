"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, ImageIcon, Eye, Palette, Tag } from "lucide-react"

export function ImageAnalyzer() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setAnalysis(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    // Simulate AI image analysis
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const mockAnalysis = {
      objects: ["laptop", "coffee cup", "notebook", "plant", "desk"],
      colors: ["#2D3748", "#F7FAFC", "#48BB78", "#ED8936", "#4299E1"],
      mood: "Professional & Productive",
      suggestions: [
        "Perfect for productivity content",
        "Great workspace aesthetic",
        "Could work well for morning routine posts",
        "Suitable for work-from-home themes",
      ],
      confidence: 94,
    }

    setAnalysis(mockAnalysis)
    setIsAnalyzing(false)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Image Analyzer
        </CardTitle>
        <CardDescription>AI-powered image analysis for better content creation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          {selectedImage ? (
            <div className="space-y-4">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Uploaded"
                className="max-w-full h-48 object-cover rounded-lg mx-auto"
              />
              <Button onClick={analyzeImage} disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing..." : "Analyze Image"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-sm font-medium">Upload an image to analyze</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              </div>
              <label htmlFor="image-upload">
                <Button variant="outline" className="cursor-pointer bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {analysis && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Analysis Results</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Confidence:</span>
                <Progress value={analysis.confidence} className="w-16 h-2" />
                <span className="text-xs font-medium">{analysis.confidence}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h5 className="text-xs font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  Detected Objects
                </h5>
                <div className="flex flex-wrap gap-1">
                  {analysis.objects.map((object: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {object}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-medium mb-2 flex items-center gap-2">
                  <Palette className="h-3 w-3" />
                  Color Palette
                </h5>
                <div className="flex gap-2">
                  {analysis.colors.map((color: string, index: number) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded border border-border"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-medium mb-2">Mood & Atmosphere</h5>
                <Badge variant="outline" className="text-xs">
                  {analysis.mood}
                </Badge>
              </div>

              <div>
                <h5 className="text-xs font-medium mb-2">Content Suggestions</h5>
                <div className="space-y-1">
                  {analysis.suggestions.map((suggestion: string, index: number) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      • {suggestion}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
