'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, Package as PackageIcon, Server, HardDrive, Cpu, Rocket, Infinity as InfinityIcon, Zap } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { formatSize } from '@/components/ResourceGauge'

interface PackageItem {
  id: string
  name: string
  displayName: string
  ramLimit: number
  diskLimit: number
  cpuLimit: number
  appLimit: number
  isUnlimited: boolean
  price: number
  color: string
}

export default function PackagesViewer() {
  const { t } = useTranslation()
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((data) => {
        if (data.packages) setPackages(data.packages)
      })
      .finally(() => setLoading(false))
  }, [])

  const colorMap: Record<string, { from: string; to: string; ring: string; text: string; glow: string }> = {
    slate: { from: 'from-slate-500/20', to: 'to-slate-700/20', ring: 'ring-slate-500/30', text: 'text-slate-400', glow: 'shadow-[0_0_30px_-8px_oklch(0.6_0.02_200/0.4)]' },
    emerald: { from: 'from-emerald-500/20', to: 'to-teal-700/20', ring: 'ring-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-[0_0_30px_-8px_oklch(0.72_0.19_165/0.5)]' },
    amber: { from: 'from-amber-500/20', to: 'to-orange-700/20', ring: 'ring-amber-500/30', text: 'text-amber-400', glow: 'shadow-[0_0_30px_-8px_oklch(0.75_0.18_85/0.5)]' },
    fuchsia: { from: 'from-fuchsia-500/30', to: 'to-purple-700/30', ring: 'ring-fuchsia-500/40', text: 'text-fuchsia-400', glow: 'shadow-[0_0_40px_-5px_oklch(0.7_0.22_320/0.6)]' },
  }

  const getC = (color: string) => colorMap[color] || colorMap.emerald

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-card h-64 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center glow-emerald">
          <PackageIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t('packages')}</h2>
          <p className="text-sm text-muted-foreground">{packages.length} {t('packages').toLowerCase()}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map((pkg, idx) => {
          const c = getC(pkg.color)
          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className={`relative overflow-hidden bg-gradient-to-br ${c.from} ${c.to} border-border/40 ${c.glow} ${pkg.isUnlimited ? 'ring-2 ' + c.ring : ''}`}>
                {pkg.isUnlimited && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-emerald-500" />
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.from} ${c.to} flex items-center justify-center ${c.text}`}>
                      {pkg.isUnlimited ? <Crown className="w-6 h-6" /> : <PackageIcon className="w-6 h-6" />}
                    </div>
                    {pkg.isUnlimited && (
                      <Badge variant="outline" className="border-fuchsia-500/50 text-fuchsia-500 gap-1">
                        <Crown className="w-3 h-3" />
                        {t('godBadge')}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-3">{pkg.displayName}</CardTitle>
                  <CardDescription>
                    {pkg.isUnlimited ? t('godPackageDesc') : `$${pkg.price}/mo`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Server className="w-3.5 h-3.5" />
                      {t('ramLimit')}
                    </span>
                    <span className={`font-medium ${c.text}`}>
                      {pkg.isUnlimited ? '∞' : formatSize(pkg.ramLimit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5" />
                      {t('diskLimit')}
                    </span>
                    <span className={`font-medium ${c.text}`}>
                      {pkg.isUnlimited ? '∞' : formatSize(pkg.diskLimit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" />
                      {t('cpuLimit')}
                    </span>
                    <span className={`font-medium ${c.text}`}>
                      {pkg.isUnlimited ? '∞' : pkg.cpuLimit + '%'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Rocket className="w-3.5 h-3.5" />
                      {t('appLimit')}
                    </span>
                    <span className={`font-medium ${c.text}`}>
                      {pkg.isUnlimited ? '∞' : pkg.appLimit}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* GOD package highlight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-emerald-500/10 p-6"
      >
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10 flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-emerald-500 flex items-center justify-center">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <h3 className="text-xl font-bold gradient-text-god">{t('godPackage')}</h3>
            <p className="text-sm text-muted-foreground">{t('godPackageDesc')}</p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: 'RAM', value: '∞' },
              { label: 'Disk', value: '∞' },
              { label: 'CPU', value: '∞' },
              { label: 'Apps', value: '∞' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-2xl font-bold gradient-text-god">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
