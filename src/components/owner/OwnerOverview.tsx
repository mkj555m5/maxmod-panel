'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Rocket, Package as PackageIcon, Server, HardDrive, Cpu, Activity, Crown, Zap } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import ResourceGauge, { formatSize } from '@/components/ResourceGauge'

interface PlatformStats {
  totalRam: number
  totalDisk: number
  usedRam: number
  usedDisk: number
  cpuUsage: number
  totalUsers: number
  totalApps: number
  activeApps: number
  totalPackages: number
}

export default function OwnerOverview() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data.platform)
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

  const statCards = [
    {
      label: t('totalUsers'),
      value: stats.totalUsers,
      icon: <Users className="w-5 h-5" />,
      color: 'text-emerald-500',
      bgGradient: 'from-emerald-500/10 to-teal-500/10',
    },
    {
      label: t('activeApps'),
      value: stats.activeApps,
      icon: <Rocket className="w-5 h-5" />,
      color: 'text-cyan-500',
      bgGradient: 'from-cyan-500/10 to-blue-500/10',
    },
    {
      label: t('totalApps'),
      value: stats.totalApps,
      icon: <Server className="w-5 h-5" />,
      color: 'text-amber-500',
      bgGradient: 'from-amber-500/10 to-orange-500/10',
    },
    {
      label: t('totalPackages'),
      value: stats.totalPackages,
      icon: <PackageIcon className="w-5 h-5" />,
      color: 'text-fuchsia-500',
      bgGradient: 'from-fuchsia-500/10 to-purple-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center glow-emerald">
          <Crown className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t('platformOverview')}</h2>
          <p className="text-sm text-muted-foreground">{t('quickStats')}</p>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`glass-card bg-gradient-to-br ${card.bgGradient} border-border/40 hover:scale-[1.02] transition-transform`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={card.color}>{card.icon}</div>
                  <Activity className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Resource gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ResourceGauge
          label={t('ramMemory')}
          used={stats.usedRam}
          total={stats.totalRam}
          color="emerald"
          icon={<Server className="w-4 h-4" />}
        />
        <ResourceGauge
          label={t('diskSpace')}
          used={stats.usedDisk}
          total={stats.totalDisk}
          color="cyan"
          icon={<HardDrive className="w-4 h-4" />}
        />
        <ResourceGauge
          label={t('cpuUsage')}
          used={stats.cpuUsage}
          total={100}
          color="amber"
          icon={<Cpu className="w-4 h-4" />}
        />
      </div>

      {/* Live activity banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-fuchsia-500/5 p-6"
      >
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{t('platform')} OK</p>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t('used')}</p>
              <p className="text-lg font-bold text-emerald-500">{formatSize(stats.usedRam)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t('available')}</p>
              <p className="text-lg font-bold text-cyan-500">{formatSize(stats.totalRam - stats.usedRam)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t('total')}</p>
              <p className="text-lg font-bold">{formatSize(stats.totalRam)}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
