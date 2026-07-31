'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, Package, Rocket, BarChart3, Settings } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

export type ViewType = 'overview' | 'users' | 'packages' | 'apps' | 'stats' | 'settings'

interface SidebarProps {
  view: ViewType
  setView: (v: ViewType) => void
  isOwner: boolean
}

export default function Sidebar({ view, setView, isOwner }: SidebarProps) {
  const { t } = useTranslation()

  const userItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t('overview'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'apps', label: t('applications'), icon: <Rocket className="w-4 h-4" /> },
    { id: 'packages', label: t('packages'), icon: <Package className="w-4 h-4" /> },
    { id: 'settings', label: t('settings'), icon: <Settings className="w-4 h-4" /> },
  ]

  const ownerItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t('overview'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: t('users'), icon: <Users className="w-4 h-4" /> },
    { id: 'apps', label: t('applications'), icon: <Rocket className="w-4 h-4" /> },
    { id: 'packages', label: t('packages'), icon: <Package className="w-4 h-4" /> },
    { id: 'stats', label: t('platform'), icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: t('settings'), icon: <Settings className="w-4 h-4" /> },
  ]

  const items = isOwner ? ownerItems : userItems

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-e border-border/40 bg-background/50 backdrop-blur-sm">
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={view === item.id ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3 h-10 text-sm font-medium transition-all',
              view === item.id && 'bg-primary/10 text-primary glow-emerald'
            )}
            onClick={() => setView(item.id)}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-3 border-t border-border/40">
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-fuchsia-500/10 p-3 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-medium text-emerald-500">System Online</p>
          </div>
          <p className="text-[10px] text-muted-foreground">Node.js 22.x • Build OK</p>
        </div>
      </div>
    </aside>
  )
}
