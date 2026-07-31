'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

interface ResourceGaugeProps {
  label: string
  used: number
  total: number
  unit?: string
  color?: 'emerald' | 'amber' | 'fuchsia' | 'cyan'
  unlimited?: boolean
  icon?: React.ReactNode
}

const colorMap = {
  emerald: {
    text: 'text-emerald-500',
    bg: 'bg-emerald-500',
    bgSoft: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_20px_-5px_oklch(0.72_0.19_165/0.5)]',
    gradient: 'from-emerald-500 to-teal-500',
  },
  amber: {
    text: 'text-amber-500',
    bg: 'bg-amber-500',
    bgSoft: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_20px_-5px_oklch(0.75_0.18_85/0.5)]',
    gradient: 'from-amber-500 to-orange-500',
  },
  fuchsia: {
    text: 'text-fuchsia-500',
    bg: 'bg-fuchsia-500',
    bgSoft: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/30',
    glow: 'shadow-[0_0_20px_-5px_oklch(0.7_0.22_320/0.5)]',
    gradient: 'from-fuchsia-500 to-purple-500',
  },
  cyan: {
    text: 'text-cyan-500',
    bg: 'bg-cyan-500',
    bgSoft: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    glow: 'shadow-[0_0_20px_-5px_oklch(0.7_0.17_195/0.5)]',
    gradient: 'from-cyan-500 to-blue-500',
  },
}

export function formatSize(mb: number): string {
  if (!isFinite(mb)) return '∞'
  if (mb >= 1024 * 1024) return (mb / (1024 * 1024)).toFixed(2) + ' TB'
  if (mb >= 1024) return (mb / 1024).toFixed(2) + ' GB'
  return mb + ' MB'
}

export default function ResourceGauge({
  label,
  used,
  total,
  unit = 'MB',
  color = 'emerald',
  unlimited = false,
  icon,
}: ResourceGaugeProps) {
  const { t } = useTranslation()
  const c = colorMap[color]
  const percent = unlimited ? 0 : total > 0 ? Math.min(100, (used / total) * 100) : 0
  const remaining = unlimited ? Infinity : Math.max(0, total - used)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'glass-card rounded-2xl p-5 relative overflow-hidden',
        c.glow
      )}
    >
      <div className={cn('absolute top-0 inset-x-0 h-1', c.bg, 'opacity-70')} />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', c.bgSoft, c.text)}>
              {icon}
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xs text-muted-foreground/70">
              {unlimited ? '∞' : `${formatSize(used)} / ${formatSize(total)}`}
            </p>
          </div>
        </div>
        {unlimited && (
          <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full', c.bgSoft, c.text)}>
            ∞ UNLIMITED
          </span>
        )}
      </div>

      {!unlimited && (
        <>
          <div className="relative w-full h-2.5 bg-muted/50 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn('h-full rounded-full bg-gradient-to-r', c.gradient)}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {formatSize(used)} {t('used')}
            </span>
            <span className={c.text}>
              {formatSize(remaining)} {t('remaining')}
            </span>
          </div>
        </>
      )}

      {unlimited && (
        <div className="mt-4 text-center py-3 rounded-lg bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-emerald-500/10 border border-fuchsia-500/20">
          <p className="text-2xl font-bold gradient-text-god">∞</p>
          <p className="text-[10px] text-muted-foreground mt-1">NO LIMITS</p>
        </div>
      )}
    </motion.div>
  )
}
