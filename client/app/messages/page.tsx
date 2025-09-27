import { MessageInbox } from "@/components/message-inbox"
import { MessageFilters } from "@/components/message-filters"
import { MessageStats } from "@/components/message-stats"
import { AutoResponseSettings } from "@/components/auto-response-settings"
import { ConversationView } from "@/components/conversation-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MessagesPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Message Processing</h1>
          <p className="text-muted-foreground">Intelligent message categorization and automated responses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <MessageStats />
          <Tabs defaultValue="conversations" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
            </TabsList>
            <TabsContent value="conversations" className="h-[600px] mt-4">
              <ConversationView />
            </TabsContent>
            <TabsContent value="inbox" className="h-[600px] mt-4">
              <MessageInbox />
            </TabsContent>
          </Tabs>
        </div>
        <div className="space-y-6">
          <MessageFilters />
          <AutoResponseSettings />
        </div>
      </div>
    </div>
  )
}
