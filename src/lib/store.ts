'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '@/lib/i18n'

export interface SessionUser {
  id: string
  username: string
  role: 'OWNER' | 'USER'
  status: string
  package: any | null
}

interface AppState {
  user: SessionUser | null
  locale: Locale
  theme: 'dark' | 'light'
  setUser: (u: SessionUser | null) => void
  setLocale: (l: Locale) => void
  toggleLocale: () => void
  setTheme: (t: 'dark' | 'light') => void
  toggleTheme: () => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      locale: 'ar',
      theme: 'dark',
      setUser: (u) => set({ user: u }),
      setLocale: (l) => {
        set({ locale: l })
        if (typeof document !== 'undefined') {
          document.documentElement.lang = l
          document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
        }
      },
      toggleLocale: () => {
        const cur = get().locale
        const next: Locale = cur === 'ar' ? 'en' : 'ar'
        get().setLocale(next)
      },
      setTheme: (t) => {
        set({ theme: t })
        if (typeof document !== 'undefined') {
          if (t === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },
      toggleTheme: () => {
        const cur = get().theme
        get().setTheme(cur === 'dark' ? 'light' : 'dark')
      },
      logout: () => set({ user: null }),
    }),
    {
      name: 'maxmod-storage',
      partialize: (s) => ({ locale: s.locale, theme: s.theme }),
    }
  )
)
