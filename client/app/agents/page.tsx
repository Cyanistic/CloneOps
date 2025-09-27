import { AgentList } from "@/components/agent-list"
import { CreateAgentDialog } from "@/components/create-agent-dialog"
import { AgentTemplates } from "@/components/agent-templates"

export default function AgentsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agent Management</h1>
          <p className="text-muted-foreground">Create and configure your specialized agents</p>
        </div>
        <CreateAgentDialog />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AgentList />
        </div>
        <div>
          <AgentTemplates />
        </div>
      </div>
    </div>
  )
}
