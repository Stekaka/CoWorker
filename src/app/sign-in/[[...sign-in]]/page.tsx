'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else if (data.user) {
        // Navigera till dashboard efter lyckad inloggning
        window.location.href = '/dashboard'
      }
    } catch (error) {
      setMessage('Ett oväntat fel uppstod')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Logga in på ditt CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hantera dina leads och kunder effektivt
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-post
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="din.email@exempel.se"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Lösenord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ditt lösenord"
              />
            </div>
          </div>

          {message && (
            <div className="text-red-600 text-sm text-center">
              {message}
            </div>
          )}

          <div className="space-y-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loggar in...' : 'Logga in'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full"
            >
              Logga in med Google
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Har du inget konto?{' '}
              <Link href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
                Registrera dig här
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
