import { SecurityOverview } from "@/components/security-overview"
import { AuditLog } from "@/components/audit-log"
import { AccessControls, AccountProvider } from "@/components/access-controls"
import { EmergencyControls } from "@/components/emergency-controls"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Security & Audit</h1>
            <p className="text-muted-foreground">Monitor system security and maintain complete audit trails</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SecurityOverview />
            <AuditLog />
          </div>
          <div className="space-y-6">
            <EmergencyControls />
            <AccountProvider>
              <AccessControls />
            </AccountProvider>
          </div>
        </div>
      </div>
    </div>
  )
}
