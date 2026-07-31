'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import Sidebar, { type ViewType } from '@/components/Sidebar'
import OwnerOverview from '@/components/owner/OwnerOverview'
import UsersManager from '@/components/owner/UsersManager'
import PackagesViewer from '@/components/owner/PackagesViewer'
import AppsManager from '@/components/AppsManager'
import UserOverview from '@/components/user/UserOverview'
import SettingsPanel from '@/components/SettingsPanel'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/hooks/use-translation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, LayoutDashboard, Users, Rocket, Package as PackageIcon, BarChart3, Settings } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAppStore()
  const { t } = useTranslation()
  const isOwner = user?.role === 'OWNER'
  const [view, setView] = useState<ViewType>('overview')

  const renderView = () => {
    switch (view) {
      case 'overview':
        return isOwner ? <OwnerOverview /> : <UserOverview />
      case 'users':
        return isOwner ? <UsersManager /> : <UserOverview />
      case 'packages':
        return <PackagesViewer />
      case 'apps':
        return <AppsManager isOwner={isOwner} />
      case 'stats':
        return isOwner ? <OwnerOverview /> : <UserOverview />
      case 'settings':
        return <SettingsPanel />
      default:
        return <OwnerOverview />
    }
  }

  const mobileMenuItems: { id: ViewType; label: string; icon: React.ReactNode }[] = isOwner
    ? [
        { id: 'overview', label: t('overview'), icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'users', label: t('users'), icon: <Users className="w-4 h-4" /> },
        { id: 'apps', label: t('applications'), icon: <Rocket className="w-4 h-4" /> },
        { id: 'packages', label: t('packages'), icon: <PackageIcon className="w-4 h-4" /> },
        { id: 'stats', label: t('platform'), icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'settings', label: t('settings'), icon: <Settings className="w-4 h-4" /> },
      ]
    : [
        { id: 'overview', label: t('overview'), icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'apps', label: t('applications'), icon: <Rocket className="w-4 h-4" /> },
        { id: 'packages', label: t('packages'), icon: <PackageIcon className="w-4 h-4" /> },
        { id: 'settings', label: t('settings'), icon: <Settings className="w-4 h-4" /> },
      ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar view={view} setView={setView} isOwner={isOwner} />

        {/* Mobile menu */}
        <div className="lg:hidden fixed bottom-4 end-4 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg glow-emerald"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mb-2">
              {mobileMenuItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  className={`gap-2 cursor-pointer ${view === item.id ? 'bg-primary/10 text-primary' : ''}`}
                  onClick={() => setView(item.id)}
                >
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <p>
            {t('poweredBy')} <span className="gradient-text-emerald font-semibold">maxmod panel</span>
          </p>
          <p>Node.js 22.x • Port 8080 • 2025</p>
        </div>
      </footer>
    </div>
  )
}
