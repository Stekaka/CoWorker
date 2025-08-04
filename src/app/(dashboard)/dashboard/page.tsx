'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentLeads } from '@/components/dashboard/recent-leads'
import { UpcomingReminders } from '@/components/dashboard/upcoming-reminders'
import { EmailActivity } from '@/components/dashboard/email-activity'

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string
  company_id: string
  companies: {
    id: string
    name: string
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      try {
        console.log('Dashboard: Checking authentication...')
        
        // Hämta autentiserad användare
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.log('Dashboard: Auth error:', authError.message)
          setError('Autentiseringsfel: ' + authError.message)
          router.push('/sign-in')
          return
        }

        if (!authUser) {
          console.log('Dashboard: No authenticated user found')
          router.push('/sign-in')
          return
        }

        console.log('Dashboard: Authenticated user found:', authUser.email)

        // Hämta användarprofil
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select(`
            *,
            companies (*)
          `)
          .eq('user_id', authUser.id)
          .eq('is_active', true)
          .single()

        if (profileError) {
          console.log('Dashboard: Profile error:', profileError.message)
          setError('Profilfel: ' + profileError.message)
          return
        }

        if (!userProfile) {
          console.log('Dashboard: No user profile found')
          setError('Ingen användarprofil hittad')
          return
        }

        console.log('Dashboard: User profile loaded:', userProfile.email)
        setUser(userProfile as UserProfile)
      } catch (error) {
        console.error('Dashboard: Unexpected error:', error)
        setError('Oväntat fel: ' + (error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Fel uppstod</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/sign-in')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Gå till inloggning
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Omdirigerar till inloggning...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Välkomstmeddelande */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Välkommen tillbaka, {user.first_name || user.email}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Här är en översikt över dina leads och aktiviteter
        </p>
      </div>

      {/* Statistik cards */}
      <DashboardStats companyId={user.company_id} userId={user.id} userRole={user.role as any} />

      {/* Grid med dashboard komponenter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Senaste leads */}
        <RecentLeads companyId={user.company_id} userId={user.id} userRole={user.role as any} />

        {/* Kommande påminnelser */}
        <UpcomingReminders companyId={user.company_id} userId={user.id} />
      </div>

      {/* E-postaktivitet */}
      <EmailActivity companyId={user.company_id} userId={user.id} userRole={user.role as any} />
    </div>
  )
}
