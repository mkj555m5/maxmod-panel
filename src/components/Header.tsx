'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Terminal, Globe, Sun, Moon, LogOut, User as UserIcon, Crown, ChevronDown } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function Header() {
  const { t, locale } = useTranslation()
  const { user, theme, toggleLocale, toggleTheme, logout } = useAppStore()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch (e) {}
    logout()
    toast.success(t('logout'))
    router.refresh()
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'MM'
  const isGod = user?.package?.isUnlimited
  const isOwner = user?.role === 'OWNER'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center glow-emerald">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-emerald-500/30 to-fuchsia-500/30 blur-sm -z-10" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text-emerald leading-tight">maxmod panel</h1>
            <p className="text-[10px] text-muted-foreground hidden sm:block">{t('tagline')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Locale toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            className="gap-1.5"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium">{locale === 'ar' ? 'EN' : 'ع'}</span>
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-9 h-9 p-0"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pe-3 ps-2 h-10 rounded-full hover:bg-accent">
                <Avatar className="w-7 h-7 border-2 border-primary/30">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium">{user?.username}</span>
                  <div className="flex items-center gap-1">
                    {isOwner && (
                      <Badge variant="outline" className="text-[9px] py-0 px-1 h-3.5 border-amber-500/50 text-amber-500">
                        {t('ownerBadge')}
                      </Badge>
                    )}
                    {isGod && (
                      <Badge variant="outline" className="text-[9px] py-0 px-1 h-3.5 border-fuchsia-500/50 text-fuchsia-500">
                        {t('godBadge')}
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {isOwner ? t('owner') : t('user')}
                    {isGod && ' • ' + t('godBadge')}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
