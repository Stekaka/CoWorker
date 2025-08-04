import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardCardProps {
  title: string
  description: string
  content: React.ReactNode
}

export function DashboardCard({ title, description, content }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}

// Temporär komponent tills vi implementerar riktiga dashboard komponenter
export function RecentLeads({ companyId, userId, userRole }: any) {
  return (
    <DashboardCard
      title="Senaste Leads"
      description="Dina senast skapade kontakter"
      content={
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Ingen data ännu. Skapa din första lead för att se aktivitet här.
          </div>
        </div>
      }
    />
  )
}

export function UpcomingReminders({ companyId, userId }: any) {
  return (
    <DashboardCard
      title="Kommande Påminnelser"
      description="Uppgifter som behöver uppföljning"
      content={
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Inga påminnelser just nu.
          </div>
        </div>
      }
    />
  )
}

export function EmailActivity({ companyId, userId, userRole }: any) {
  return (
    <DashboardCard
      title="E-postaktivitet"
      description="Senaste utskick och öppningar"
      content={
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Ingen e-postaktivitet ännu.
          </div>
        </div>
      }
    />
  )
}
