import { Suspense } from 'react'
import { getCurrentUser, getCompanyId } from '@/lib/auth'
import { LeadsList } from '@/components/leads/leads-list'
import { LeadsFilters } from '@/components/leads/leads-filters'
import { CreateLeadButton } from '@/components/leads/create-lead-button'

interface LeadsPageProps {
  searchParams: {
    page?: string
    search?: string
    status?: string
    assignedTo?: string
  }
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const user = await getCurrentUser()
  const companyId = await getCompanyId()

  if (!user || !companyId) {
    return <div>Ingen användardata hittad</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-600">
            Hantera dina kontakter och potentiella kunder
          </p>
        </div>
        <CreateLeadButton />
      </div>

      {/* Filter */}
      <Suspense fallback={<div>Laddar filter...</div>}>
        <LeadsFilters companyId={companyId} userRole={user.role} />
      </Suspense>

      {/* Leads lista */}
      <Suspense fallback={<div>Laddar leads...</div>}>
        <LeadsList 
          companyId={companyId}
          userId={user.id}
          userRole={user.role}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}
