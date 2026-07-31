'use client'

import { useEffect, useState } from 'react'
import LoginForm from '@/components/LoginForm'
import Dashboard from '@/components/Dashboard'
import { useAppStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { user, setUser, locale, theme } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Apply locale & theme on mount
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    // Check session
    fetch('/api/auth')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [locale, theme, setUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">Loading maxmod panel...</p>
        </div>
      </div>
    )
  }

  return user ? <Dashboard /> : <LoginForm />
}
