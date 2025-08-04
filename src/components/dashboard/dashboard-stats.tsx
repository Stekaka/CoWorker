'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, UserPlus, Target, TrendingUp, Calendar } from 'lucide-react'

interface DashboardStatsProps {
  companyId: string
  userId: string
  userRole: 'USER' | 'ADMIN'
}

export function DashboardStats({ companyId, userId, userRole }: DashboardStatsProps) {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        // Enkel statistik för nu - expanderar senare
        const statsData = [
          {
            name: 'Totalt Leads',
            value: '0',
            icon: Users,
            change: 'Inga nya denna vecka',
            changeType: 'neutral',
          },
          {
            name: 'Nya Leads',
            value: '0',
            icon: UserPlus,
            change: 'Senaste 7 dagarna',
            changeType: 'neutral',
          },
          {
            name: 'Kvalificerade',
            value: '0',
            icon: Target,
            change: '0% av totalt',
            changeType: 'neutral',
          },
          {
            name: 'Konverteringsgrad',
            value: '0.0%',
            icon: TrendingUp,
            change: '0 vunna affärer',
            changeType: 'neutral',
          },
          {
            name: 'Väntande Påminnelser',
            value: '0',
            icon: Calendar,
            change: 'Inga förfallna uppgifter',
            changeType: 'positive',
          },
        ]

        setStats(statsData)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [companyId, userId, userRole])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon
                  className="h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span
                className={`font-medium ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : stat.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
