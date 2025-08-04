'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestLoginPage() {
  const [email, setEmail] = useState('oliver@dronarkompaniet.se')
  const [password, setPassword] = useState('test123456')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)

  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      console.log('Attempting sign in...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Sign in response:', { data, error })
      console.log('Cookies after login:', document.cookie)

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else if (data.user) {
        setMessage('Success! User logged in.')
        setUserInfo(data.user)
        
        // Vänta en sekund och testa igen
        setTimeout(async () => {
          const { data: userData, error: userError } = await supabase.auth.getUser()
          console.log('Get user after timeout:', { userData, userError })
          console.log('Cookies after timeout:', document.cookie)
        }, 1000)
      }
    } catch (error) {
      console.error('Exception:', error)
      setMessage('Ett oväntat fel uppstod')
    } finally {
      setLoading(false)
    }
  }

  const checkCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('Current user check:', { user, error })
    console.log('All cookies:', document.cookie)
    
    if (user) {
      setUserInfo(user)
      setMessage(`Current user: ${user.email}`)
    } else {
      setMessage(`No current user found. Error: ${error?.message || 'Unknown'}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Test Login</h1>
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-post</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Lösenord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loggar in...' : 'Test Login'}
          </button>
        </form>

        <button
          onClick={checkCurrentUser}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
        >
          Check Current User
        </button>

        {message && (
          <div className="text-sm p-3 bg-gray-100 rounded">
            {message}
          </div>
        )}

        {userInfo && (
          <div className="text-xs p-3 bg-blue-50 rounded">
            <pre>{JSON.stringify(userInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
