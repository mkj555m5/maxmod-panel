'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Settings as SettingsIcon, Globe, Sun, Moon, Crown, Package as PackageIcon, Calendar, Shield } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useAppStore } from '@/lib/store'
import { formatSize } from '@/components/ResourceGauge'

export default function SettingsPanel() {
  const { t, locale } = useTranslation()
  const { user, theme, toggleTheme, toggleLocale } = useAppStore()

  const isGod = user?.package?.isUnlimited
  const isOwner = user?.role === 'OWNER'

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t('settings')}</h2>
          <p className="text-sm text-muted-foreground">{t('accountInfo')}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile card */}
        <Card className="glass-card border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-4 h-4 text-primary" />
              {t('profile')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-primary/30">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-lg font-bold">
                  {user?.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-bold">{user?.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  {isOwner && (
                    <Badge variant="outline" className="border-amber-500/50 text-amber-500 gap-1">
                      <Crown className="w-3 h-3" />
                      {t('owner')}
                    </Badge>
                  )}
                  {!isOwner && (
                    <Badge variant="outline" className="gap-1">
                      {t('user')}
                    </Badge>
                  )}
                  {isGod && (
                    <Badge variant="outline" className="border-fuchsia-500/50 text-fuchsia-500 gap-1">
                      <Crown className="w-3 h-3" />
                      {t('godBadge')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <PackageIcon className="w-3.5 h-3.5" />
                  {t('package')}
                </span>
                <span className="font-medium">{user?.package?.displayName || t('noPackage')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {t('memberSince')}
                </span>
                <span className="font-medium">2025</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package details */}
        {user?.package && (
          <Card className="glass-card border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PackageIcon className="w-4 h-4 text-primary" />
                {t('packageResources')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('ramLimit')}</span>
                <span className="font-medium text-emerald-500">
                  {isGod ? '∞' : formatSize(user.package.ramLimit)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('diskLimit')}</span>
                <span className="font-medium text-cyan-500">
                  {isGod ? '∞' : formatSize(user.package.diskLimit)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('cpuLimit')}</span>
                <span className="font-medium text-amber-500">
                  {isGod ? '∞' : user.package.cpuLimit + '%'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('appLimit')}</span>
                <span className="font-medium text-fuchsia-500">
                  {isGod ? '∞' : user.package.appLimit}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preferences */}
      <Card className="glass-card border-border/40">
        <CardHeader>
          <CardTitle className="text-lg">{t('settings')}</CardTitle>
          <CardDescription>Customize your panel experience</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={toggleLocale}
            className="h-16 justify-start gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-start">
              <p className="text-xs text-muted-foreground">{t('language')}</p>
              <p className="text-sm font-medium">
                {locale === 'ar' ? t('arabic') : t('english')}
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={toggleTheme}
            className="h-16 justify-start gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div className="text-start">
              <p className="text-xs text-muted-foreground">{t('theme')}</p>
              <p className="text-sm font-medium">
                {theme === 'dark' ? t('dark') : t('light')}
              </p>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
