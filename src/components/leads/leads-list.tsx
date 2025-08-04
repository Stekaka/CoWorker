'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface LeadsListProps {
  companyId: string
  userId: string
  userRole: string
  searchParams: any
}

export function LeadsList({ companyId, userId, userRole, searchParams }: LeadsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dina Leads</CardTitle>
        <CardDescription>
          Hantera och följ upp dina kontakter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Inga leads skapade ännu.</p>
          <p className="text-sm mt-2">Klicka på "Ny Lead" för att komma igång.</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function LeadsFilters({ companyId, userRole }: any) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="text-sm text-gray-600">
        Filter kommer här...
      </div>
    </div>
  )
}
