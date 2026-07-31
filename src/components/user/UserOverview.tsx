'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Server, HardDrive, Cpu, Rocket, Crown, Package as PackageIcon, Zap, Activity } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useAppStore } from '@/lib/store'
import ResourceGauge, { formatSize } from '@/components/ResourceGauge'
import { Badge } from '@/components/ui/badge'

interface UserStats {
  ramUsed: number
  diskUsed: number
  appCount: number
  package: any
}

interface PlatformStats {
  totalUsers: number
  totalApps: number
  activeApps: number
  cpuUsage: number
}

export default function UserOverview() {
  const { t } = useTranslation()
  const { user } = useAppStore()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [platform, setPlatform] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data.userStats)
          setPlatform(data.platform)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
    const i = setInterval(load, 5000)
    return () => clearInterval(i)
  }, [])

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="glass-card h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  const isGod = stats.package?.isUnlimited
  const pkg = stats.package

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center glow-emerald ${
          isGod ? 'bg-gradient-to-br from-fuchsia-500 via-purple-500 to-emerald-500' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
        }`}>
          {isGod ? <Crown className="w-5 h-5 text-white" /> : <PackageIcon className="w-5 h-5 text-white" />}
        </div>
        <div>
          <h2 className="text-2xl font-bold">
            {t('welcomeBack')}, {user?.username}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isGod ? t('godPackage') : pkg?.displayName}
            {isGod && (
              <Badge variant="outline" className="ms-2 border-fuchsia-500/50 text-fuchsia-500 gap-1">
                <Crown className="w-3 h-3" />
                {t('godBadge')}
              </Badge>
            )}
          </p>
        </div>
      </motion.div>

      {/* Welcome banner */}
      {!isGod && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-fuchsia-500/5 p-5"
        >
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{t('packageResources')}</p>
              <p className="text-lg font-bold gradient-text-emerald mt-1">{pkg?.displayName}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('apps')}</p>
                <p className="font-bold">
                  {stats.appCount} / {pkg?.appLimit}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('ramMemory')}</p>
                <p className="font-bold text-emerald-500">
                  {formatSize(stats.ramUsed)} / {formatSize(pkg?.ramLimit || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('diskSpace')}</p>
                <p className="font-bold text-cyan-500">
                  {formatSize(stats.diskUsed)} / {formatSize(pkg?.diskLimit || 0)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* GOD banner */}
      {isGod && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-500/15 via-purple-500/15 to-emerald-500/15 p-6"
        >
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-emerald-500 flex items-center justify-center">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold gradient-text-god">{t('godPackage')}</h3>
                <p className="text-sm text-muted-foreground">{t('godPackageDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text-god">∞</p>
                <p className="text-[10px] text-muted-foreground">RAM</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text-god">∞</p>
                <p className="text-[10px] text-muted-foreground">Disk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text-god">∞</p>
                <p className="text-[10px] text-muted-foreground">Apps</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Resource gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ResourceGauge
          label={t('ramMemory')}
          used={stats.ramUsed}
          total={pkg?.ramLimit || 0}
          color="emerald"
          unlimited={isGod}
          icon={<Server className="w-4 h-4" />}
        />
        <ResourceGauge
          label={t('diskSpace')}
          used={stats.diskUsed}
          total={pkg?.diskLimit || 0}
          color="cyan"
          unlimited={isGod}
          icon={<HardDrive className="w-4 h-4" />}
        />
        <ResourceGauge
          label={t('applications')}
          used={stats.appCount}
          total={pkg?.appLimit || 0}
          color="amber"
          unlimited={isGod}
          icon={<Rocket className="w-4 h-4" />}
        />
      </div>

      {/* Platform info */}
      {platform && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {t('platform')} • {t('quickStats')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="glass-card border-border/40">
              <CardContent className="p-4 text-center">
                <Rocket className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{platform.activeApps}</p>
                <p className="text-[10px] text-muted-foreground">{t('activeApps')}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/40">
              <CardContent className="p-4 text-center">
                <Server className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{platform.totalApps}</p>
                <p className="text-[10px] text-muted-foreground">{t('totalApps')}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/40">
              <CardContent className="p-4 text-center">
                <Cpu className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{platform.cpuUsage.toFixed(1)}%</p>
                <p className="text-[10px] text-muted-foreground">{t('cpuUsage')}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/40">
              <CardContent className="p-4 text-center">
                <Zap className="w-5 h-5 text-fuchsia-500 mx-auto mb-1" />
                <p className="text-xl font-bold">22.x</p>
                <p className="text-[10px] text-muted-foreground">Node.js</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  )
}
