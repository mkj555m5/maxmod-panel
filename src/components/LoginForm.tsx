'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, User, Zap, Shield, Server, Globe, Crown, Loader2, Terminal } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export default function LoginForm() {
  const { t, locale } = useTranslation()
  const { setUser, locale: curLocale, setLocale } = useAppStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Sync dir/lang on mount
    setLocale(curLocale)
  }, [curLocale, setLocale])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(t('invalidCredentials'))
        return
      }
      setUser(data.user)
      toast.success(t('welcomeBack') + ', ' + data.user.username)
    } catch (e) {
      toast.error(t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pulse-glow" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl pulse-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 glow-emerald-strong"
          >
            <Terminal className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold gradient-text-emerald mb-2">
            maxmod panel
          </h1>
          <p className="text-muted-foreground text-sm">{t('tagline')}</p>
        </div>

        <Card className="glass-card-strong border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              {t('welcomeBack')}
            </CardTitle>
            <CardDescription>{t('loginSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('username')}</Label>
                <div className="relative">
                  <User className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="mkj555m"
                    className="ps-9 bg-background/50"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="ps-9 bg-background/50"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 glow-emerald"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 me-2" />
                    {t('signIn')}
                  </>
                )}
              </Button>
            </form>

            {/* Feature badges */}
            <div className="mt-6 pt-6 border-t border-border/40 grid grid-cols-3 gap-3 text-center">
              <div className="space-y-1">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
                  <Server className="w-4 h-4" />
                </div>
                <p className="text-[10px] text-muted-foreground">{t('latestNode')}</p>
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500">
                  <Shield className="w-4 h-4" />
                </div>
                <p className="text-[10px] text-muted-foreground">{t('ownerBadge')}</p>
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-fuchsia-500/10 text-fuchsia-500">
                  <Crown className="w-4 h-4" />
                </div>
                <p className="text-[10px] text-muted-foreground">{t('godBadge')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language switcher */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Globe className="w-4 h-4 me-2" />
            {locale === 'ar' ? 'English' : 'العربية'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
