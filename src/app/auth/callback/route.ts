import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Använd admin client för att undvika RLS problem
      const adminClient = createAdminClient()
      
      // Kontrollera om user_profile redan existerar
      const { data: existingProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .single()

      // Skapa user_profile om den inte existerar
      if (!existingProfile) {
        try {
          // Extrahera metadata från användaren
          const metadata = data.user.user_metadata || {}
          const firstName = metadata.first_name || ''
          const lastName = metadata.last_name || ''
          const companyName = metadata.company_name || 'Demo Company'

          // Skapa eller hämta företag
          let companyId: string
          
          if (companyName && companyName !== 'Demo Company') {
            const { data: company, error: companyError } = await adminClient
              .from('companies')
              .upsert({
                name: companyName,
                slug: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              }, {
                onConflict: 'slug'
              })
              .select()
              .single()
            
            if (companyError) {
              console.error('Company creation error:', companyError)
              companyId = 'default'
            } else {
              companyId = company.id
            }
          } else {
            // Skapa demo företag om det inte finns
            const { data: demoCompany, error: demoError } = await adminClient
              .from('companies')
              .upsert({
                name: 'Demo Company',
                slug: 'demo-company',
              }, {
                onConflict: 'slug'
              })
              .select()
              .single()
            
            companyId = demoCompany?.id || 'default'
          }
          
          // Skapa användarprofil
          const { error: profileError } = await adminClient
            .from('user_profiles')
            .insert({
              user_id: data.user.id,
              company_id: companyId,
              email: data.user.email || '',
              first_name: firstName,
              last_name: lastName,
              role: companyName && companyName !== 'Demo Company' ? 'ADMIN' : 'USER',
            })
          
          if (profileError) {
            console.error('Profile creation error:', profileError)
          }
        } catch (error) {
          console.error('Error creating user profile:', error)
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
