import { PostComposer } from "@/components/post-composer";
import { PostHistory } from "@/components/post-history";
import { CaptionGenerator } from "@/components/caption-generator";
import { EngagementPanel } from "@/components/engagement-panel";

export default function SocialPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Social Media</h1>
          <p className="text-muted-foreground">Create and manage your social media posts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PostComposer />
          <PostHistory />
        </div>
        <div className="space-y-6">
          <CaptionGenerator />
          <EngagementPanel />
        </div>
      </div>
    </div>
  )
}