import { CaptionGenerator } from "@/components/caption-generator"
import { ImageAnalyzer } from "@/components/image-analyzer"
import { ContentResearch } from "@/components/content-research"
import { HashtagSuggestions } from "@/components/hashtag-suggestions"

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Content Creation Tools</h1>
            <p className="text-muted-foreground">AI-powered tools to enhance your content creation workflow</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <CaptionGenerator />
            <ContentResearch />
          </div>
          <div className="space-y-6">
            <ImageAnalyzer />
            <HashtagSuggestions />
          </div>
        </div>
      </div>
    </div>
  )
}
