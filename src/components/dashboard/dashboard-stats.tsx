import { createClient } from '@/lib/supabase/server'
import { 
  Users, 
  UserPlus, 
  Target, 
  TrendingUp, 
  Mail, 
  MailOpen,
  Calendar,
  DollarSign 
} from 'lucide-react'

interface DashboardStatsProps {
  companyId: string
  userId: string
  userRole: 'USER' | 'ADMIN'
}

export async function DashboardStats({ companyId, userId, userRole }: DashboardStatsProps) {
  const supabase = await createClient()

  // Hämta statistik baserat på användarens roll
  const isAdmin = userRole === 'ADMIN'
  
  // Base query för leads baserat på roll
  let leadsQuery = supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('is_active', true)

  if (!isAdmin) {
    leadsQuery = leadsQuery.eq('assigned_to_id', userId)
  }

  // Hämta olika statistik parallellt
  const [
    { count: totalLeads },
    { count: newLeads },
    { count: qualifiedLeads },
    { count: closedWonLeads },
    { count: pendingReminders },
    { count: emailsSent },
    { count: emailsOpened },
  ] = await Promise.all([
    // Totalt antal leads
    leadsQuery,
    
    // Nya leads (senaste 7 dagarna)
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .modify((query) => !isAdmin ? query.eq('assigned_to_id', userId) : query),
    
    // Kvalificerade leads
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true)
      .eq('status', 'QUALIFIED')
      .modify((query) => !isAdmin ? query.eq('assigned_to_id', userId) : query),
    
    // Vunna affärer
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true)
      .eq('status', 'CLOSED_WON')
      .modify((query) => !isAdmin ? query.eq('assigned_to_id', userId) : query),
    
    // Väntande påminnelser
    supabase
      .from('reminders')
      .select('*, leads!inner(*)', { count: 'exact', head: true })
      .eq('leads.company_id', companyId)
      .eq('status', 'PENDING')
      .lte('due_date', new Date().toISOString())
      .modify((query) => !isAdmin ? query.eq('user_id', userId) : query),
    
    // E-post skickade (senaste 30 dagarna)
    supabase
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .modify((query) => !isAdmin ? query.eq('sent_by_id', userId) : query),
    
    // E-post öppnade
    supabase
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'OPENED')
      .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .modify((query) => !isAdmin ? query.eq('sent_by_id', userId) : query),
  ])

  // Beräkna konverteringsgrad
  const conversionRate = (totalLeads || 0) > 0 ? ((closedWonLeads || 0) / (totalLeads || 0)) * 100 : 0
  const emailOpenRate = (emailsSent || 0) > 0 ? ((emailsOpened || 0) / (emailsSent || 0)) * 100 : 0

  const stats = [
    {
      name: 'Totalt Leads',
      value: (totalLeads || 0).toString(),
      icon: Users,
      change: (newLeads || 0) > 0 ? `+${newLeads} denna vecka` : 'Inga nya denna vecka',
      changeType: (newLeads || 0) > 0 ? 'positive' : 'neutral',
    },
    {
      name: 'Nya Leads',
      value: (newLeads || 0).toString(),
      icon: UserPlus,
      change: 'Senaste 7 dagarna',
      changeType: 'neutral',
    },
    {
      name: 'Kvalificerade',
      value: (qualifiedLeads || 0).toString(),
      icon: Target,
      change: (totalLeads || 0) > 0 ? `${(((qualifiedLeads || 0) / (totalLeads || 0)) * 100).toFixed(1)}% av totalt` : '0%',
      changeType: 'neutral',
    },
    {
      name: 'Konverteringsgrad',
      value: `${conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      change: `${closedWonLeads || 0} vunna affärer`,
      changeType: conversionRate > 15 ? 'positive' : conversionRate > 5 ? 'neutral' : 'negative',
    },
    {
      name: 'E-post Skickade',
      value: (emailsSent || 0).toString(),
      icon: Mail,
      change: 'Senaste 30 dagarna',
      changeType: 'neutral',
    },
    {
      name: 'Öppningsgrad',
      value: `${emailOpenRate.toFixed(1)}%`,
      icon: MailOpen,
      change: `${emailsOpened || 0} öppnade`,
      changeType: emailOpenRate > 25 ? 'positive' : emailOpenRate > 15 ? 'neutral' : 'negative',
    },
    {
      name: 'Väntande Påminnelser',
      value: (pendingReminders || 0).toString(),
      icon: Calendar,
      change: 'Förfallna uppgifter',
      changeType: (pendingReminders || 0) > 0 ? 'negative' : 'positive',
    },
  ]

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
