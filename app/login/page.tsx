'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="h-2 w-full bg-[#0B6E33]" />

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
            <div className="bg-[#0B6E33] px-6 py-5 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/divlogo.webp"
                alt="Division Logo"
                className="mx-auto mb-2 h-12 w-12 rounded-full object-cover bg-white"
              />
              <h1 className="text-white font-semibold text-base">
                Research &amp; Innovation HUB
              </h1>
              <p className="text-[#d7ead9] text-xs mt-0.5">
                SDO Davao City
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E33] focus:border-[#0B6E33]"
                  placeholder="you@deped.gov.ph"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E33] focus:border-[#0B6E33]"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#0B6E33] text-white text-sm font-medium py-2.5 hover:bg-[#095C2A] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-xs text-slate-400 text-center pt-1">
                Accounts are created by the system administrator.
                Contact your Division office if you need access.
              </p>

              <p className="text-xs text-center pt-1">
                <a href="/signup" className="text-[#0B6E33] hover:underline">
                  New here? Register your account
                </a>
              </p>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Schools Division Office of Davao City · Research &amp; Innovation HUB
          </p>
        </div>
      </div>
    </div>
  )
}