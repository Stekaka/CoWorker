import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Dirigera inloggade användare till dashboard
  if (user) {
    redirect('/dashboard')
  }
  
  // Dirigera icke-inloggade användare till sign-in
  redirect('/sign-in')
}
