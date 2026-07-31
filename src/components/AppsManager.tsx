'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Rocket, Plus, Play, Square, RotateCcw, Trash2, ExternalLink, Loader2, AlertTriangle, Crown, Terminal, Server } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { toast } from 'sonner'
import { formatSize } from '@/components/ResourceGauge'

interface AppItem {
  id: string
  name: string
  status: string
  port: number
  ramUsed: number
  diskUsed: number
  cpuUsed: number
  nodeVersion: string
  repoUrl: string | null
  user?: { username: string }
  createdAt: string
}

interface UserStats {
  ramUsed: number
  diskUsed: number
  appCount: number
  package: any
}

export default function AppsManager({ isOwner }: { isOwner: boolean }) {
  const { t } = useTranslation()
  const [apps, setApps] = useState<AppItem[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    nodeVersion: '22.x',
    repoUrl: '',
    port: '',
    ramNeeded: '256',
    diskNeeded: '256',
  })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const [a, s] = await Promise.all([
        fetch('/api/apps').then((r) => r.json()),
        fetch('/api/stats').then((r) => r.json()),
      ])
      if (a.apps) setApps(a.apps)
      if (s.userStats) setUserStats(s.userStats)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const i = setInterval(load, 5000)
    return () => clearInterval(i)
  }, [])

  const handleCreate = async () => {
    if (!form.name) {
      toast.error(t('appName'))
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          nodeVersion: form.nodeVersion,
          repoUrl: form.repoUrl || null,
          port: form.port ? parseInt(form.port) : undefined,
          ramNeeded: parseInt(form.ramNeeded) || 256,
          diskNeeded: parseInt(form.diskNeeded) || 256,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg =
          data.error === 'app_limit_reached' ? t('appLimitReached') :
          data.error === 'ram_limit_reached' ? t('ramLimitReached') :
          data.error === 'disk_limit_reached' ? t('diskLimitReached') :
          data.error === 'no_package' ? t('noPackage') :
          t('error')
        toast.error(msg)
        return
      }
      toast.success(t('appDeployed'))
      setForm({ name: '', nodeVersion: '22.x', repoUrl: '', port: '', ramNeeded: '256', diskNeeded: '256' })
      setDialogOpen(false)
      load()
    } catch (e) {
      toast.error(t('error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleAction = async (app: AppItem, action: 'start' | 'stop' | 'restart') => {
    setActionLoading(app.id + action)
    try {
      const res = await fetch(`/api/apps/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        toast.error(t('error'))
        return
      }
      toast.success(action === 'start' ? t('appStarted') : action === 'stop' ? t('appStopped') : t('appDeployed'))
      load()
    } catch (e) {
      toast.error(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (app: AppItem) => {
    if (!confirm(t('deleteApp') + ' - ' + app.name + '?')) return
    setActionLoading(app.id + 'delete')
    try {
      const res = await fetch(`/api/apps/${app.id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error(t('error'))
        return
      }
      toast.success(t('appDeleted'))
      load()
    } catch (e) {
      toast.error(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

  const isUnlimited = userStats?.package?.isUnlimited || isOwner

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="glass-card h-48 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow-emerald">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('applications')}</h2>
            <p className="text-sm text-muted-foreground">
              {apps.length} {t('apps')}
              {!isUnlimited && userStats?.package && (
                <span className="ms-2">
                  • {userStats.appCount}/{userStats.package.appLimit} {t('apps')}
                </span>
              )}
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              {t('createApp')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('createApp')}</DialogTitle>
              <DialogDescription>{t('createAppDesc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>{t('appName')}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="my-node-app"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('nodeVersion')}</Label>
                  <Select value={form.nodeVersion} onValueChange={(v) => setForm({ ...form, nodeVersion: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="22.x">Node.js 22.x (LTS)</SelectItem>
                      <SelectItem value="21.x">Node.js 21.x</SelectItem>
                      <SelectItem value="20.x">Node.js 20.x (LTS)</SelectItem>
                      <SelectItem value="18.x">Node.js 18.x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('port')}</Label>
                  <Input
                    type="number"
                    value={form.port}
                    onChange={(e) => setForm({ ...form, port: e.target.value })}
                    placeholder="8080"
                  />
                </div>
              </div>
              {!isUnlimited && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>RAM (MB)</Label>
                    <Input
                      type="number"
                      value={form.ramNeeded}
                      onChange={(e) => setForm({ ...form, ramNeeded: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Disk (MB)</Label>
                    <Input
                      type="number"
                      value={form.diskNeeded}
                      onChange={(e) => setForm({ ...form, diskNeeded: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>{t('repoUrl')}</Label>
                <Input
                  value={form.repoUrl}
                  onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                  placeholder="https://github.com/user/repo"
                />
              </div>
              {!isUnlimited && userStats?.package && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-amber-500">
                    {t('limitExceededDesc')} - {t('ramLimit')}: {formatSize(userStats.package.ramLimit)} • {t('diskLimit')}: {formatSize(userStats.package.diskLimit)} • {t('appLimit')}: {userStats.package.appLimit}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Rocket className="w-4 h-4 me-2" />}
                {t('deploy')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Apps grid */}
      {apps.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted/30 mb-4">
            <Rocket className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('noApps')}</h3>
          <p className="text-sm text-muted-foreground">{t('noAppsDesc')}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {apps.map((app, idx) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-card border-border/40 hover:scale-[1.02] transition-transform relative overflow-hidden">
                  {app.status === 'RUNNING' && (
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 pulse-glow" />
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          app.status === 'RUNNING' ? 'bg-emerald-500/15 text-emerald-500' :
                          app.status === 'DEPLOYING' ? 'bg-amber-500/15 text-amber-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {app.status === 'RUNNING' ? <Server className="w-5 h-5" /> :
                           <Terminal className="w-5 h-5" />}
                        </div>
                        <div>
                          <CardTitle className="text-base">{app.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-0.5">
                            {app.status === 'RUNNING' && (
                              <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 gap-1 text-[10px]">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {t('running')}
                              </Badge>
                            )}
                            {app.status === 'STOPPED' && (
                              <Badge variant="outline" className="text-[10px]">
                                {t('stopped')}
                              </Badge>
                            )}
                            {app.status === 'DEPLOYING' && (
                              <Badge variant="outline" className="border-amber-500/50 text-amber-500 gap-1 text-[10px]">
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                {t('deploying')}
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground">:{app.port}</span>
                          </div>
                        </div>
                      </div>
                      {isOwner && app.user && (
                        <span className="text-[10px] text-muted-foreground">{app.user.username}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Resource usage */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-muted/30 py-2">
                        <p className="text-[10px] text-muted-foreground">RAM</p>
                        <p className="text-sm font-medium text-emerald-500">{formatSize(app.ramUsed)}</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 py-2">
                        <p className="text-[10px] text-muted-foreground">Disk</p>
                        <p className="text-sm font-medium text-cyan-500">{formatSize(app.diskUsed)}</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 py-2">
                        <p className="text-[10px] text-muted-foreground">CPU</p>
                        <p className="text-sm font-medium text-amber-500">{app.cpuUsed.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Node version badge */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Terminal className="w-3 h-3" />
                        Node.js {app.nodeVersion}
                      </span>
                      {app.repoUrl && (
                        <a
                          href={app.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          repo
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-2 border-t border-border/40">
                      {app.status !== 'RUNNING' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 gap-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                          onClick={() => handleAction(app, 'start')}
                          disabled={actionLoading === app.id + 'start'}
                        >
                          {actionLoading === app.id + 'start' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                          {t('start')}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 gap-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                          onClick={() => handleAction(app, 'stop')}
                          disabled={actionLoading === app.id + 'stop'}
                        >
                          {actionLoading === app.id + 'stop' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                          {t('stop')}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => handleAction(app, 'restart')}
                        disabled={actionLoading === app.id + 'restart'}
                      >
                        {actionLoading === app.id + 'restart' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        {t('restart')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 w-9 h-9 p-0"
                        onClick={() => handleDelete(app)}
                        disabled={actionLoading === app.id + 'delete'}
                      >
                        {actionLoading === app.id + 'delete' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
