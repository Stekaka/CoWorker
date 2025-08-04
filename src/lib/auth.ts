import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProfileWithCompany = UserProfile & {
  companies: Database['public']['Tables']['companies']['Row']
}

/**
 * Hämtar den aktuella användaren från Supabase Auth och user_profiles
 * Används för att få användardata och företags-kontext
 */
export async function getCurrentUser(): Promise<UserProfileWithCompany | null> {
  try {
    const supabase = await createClient()
    
    // Hämta autentiserad användare
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }

    // Hämta användarens profil med företagsinformation
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        companies (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (profileError || !userProfile) {
      return null
    }

    return userProfile as UserProfileWithCompany
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Kontrollerar om användaren har admin-rättigheter
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}

/**
 * Hämtar användarens företags-ID för multi-tenant filtering
 */
export async function getCompanyId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.company_id || null
}

/**
 * Skapar användarens profil vid första inloggningen
 */
export async function createUserProfile(
  userId: string,
  email: string,
  firstName?: string,
  lastName?: string,
  companyName?: string
) {
  const supabase = await createClient()
  
  // Skapa eller hämta företag
  let companyId: string
  
  if (companyName) {
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        slug: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      })
      .select()
      .single()
    
    if (companyError) {
      throw new Error(`Failed to create company: ${companyError.message}`)
    }
    
    companyId = company.id
  } else {
    // Standard demo företag om inget anges
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', 'demo-company')
      .single()
    
    companyId = company?.id || 'default'
  }
  
  // Skapa användarprofil
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      company_id: companyId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: companyName ? 'ADMIN' : 'USER', // Första användaren som skapar företag blir admin
    })
    .select()
    .single()
  
  if (profileError) {
    throw new Error(`Failed to create user profile: ${profileError.message}`)
  }
  
  return profile
}
