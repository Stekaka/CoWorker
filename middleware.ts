import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // VIKTIGT: Detta uppdaterar sessionen och säkerställer cookies
  const { data: { user } } = await supabase.auth.getUser()

  // Publika rutter
  const publicPaths = ['/sign-in', '/sign-up', '/test-login']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Root redirect
  if (request.nextUrl.pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  // Skydda privata rutter
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Omdirigera inloggade användare från publika sidor
  if (user && isPublicPath && request.nextUrl.pathname !== '/test-login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
