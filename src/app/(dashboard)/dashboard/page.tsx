import { Suspense } from 'react'
import { getCurrentUser, getCompanyId } from '@/lib/auth'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentLeads } from '@/components/dashboard/recent-leads'
import { UpcomingReminders } from '@/components/dashboard/upcoming-reminders'
import { EmailActivity } from '@/components/dashboard/email-activity'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const companyId = await getCompanyId()

  if (!user || !companyId) {
    return <div>Ingen användardata hittad</div>
  }

  return (
    <div className="space-y-6">
      {/* Välkomstmeddelande */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Välkommen tillbaka, {user.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Här är en översikt över dina leads och aktiviteter
        </p>
      </div>

      {/* Statistik cards */}
      <Suspense fallback={<div>Laddar statistik...</div>}>
        <DashboardStats companyId={companyId} userId={user.id} userRole={user.role} />
      </Suspense>

      {/* Grid med dashboard komponenter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Senaste leads */}
        <Suspense fallback={<div>Laddar leads...</div>}>
          <RecentLeads companyId={companyId} userId={user.id} userRole={user.role} />
        </Suspense>

        {/* Kommande påminnelser */}
        <Suspense fallback={<div>Laddar påminnelser...</div>}>
          <UpcomingReminders companyId={companyId} userId={user.id} />
        </Suspense>
      </div>

      {/* E-postaktivitet */}
      <Suspense fallback={<div>Laddar e-postaktivitet...</div>}>
        <EmailActivity companyId={companyId} userId={user.id} userRole={user.role} />
      </Suspense>
    </div>
  )
}
