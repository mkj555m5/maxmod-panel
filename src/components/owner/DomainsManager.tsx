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
import {
  Globe,
  Plus,
  Trash2,
  Star,
  ExternalLink,
  Loader2,
  Shield,
  Server,
  Rocket,
  Info,
  CheckCircle2,
  AlertCircle,
  Crown,
  Wifi,
} from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { toast } from 'sonner'

interface DomainItem {
  id: string
  hostname: string
  type: string
  status: string
  sslStatus: string
  isPrimary: boolean
  appId: string | null
  app?: { id: string; name: string; user?: { username: string } } | null
  createdAt: string
}

interface AppItem {
  id: string
  name: string
}

export default function DomainsManager() {
  const { t } = useTranslation()
  const [domains, setDomains] = useState<DomainItem[]>([])
  const [apps, setApps] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    hostname: '',
    type: 'CUSTOM',
    appId: '',
    isPrimary: false,
  })

  const load = async () => {
    try {
      const [d, a] = await Promise.all([
        fetch('/api/domains').then((r) => r.json()),
        fetch('/api/apps').then((r) => r.json()),
      ])
      if (d.domains) setDomains(d.domains)
      if (a.apps) setApps(a.apps)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    if (!form.hostname) {
      toast.error(t('hostnameRequired'))
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostname: form.hostname,
          type: form.type,
          appId: form.appId || null,
          isPrimary: form.isPrimary,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg =
          data.error === 'hostname_exists' ? t('hostnameExists') :
          data.error === 'invalid_hostname' ? t('invalidHostname') :
          data.error === 'hostname_required' ? t('hostnameRequired') :
          data.error === 'forbidden' ? t('error') :
          t('error')
        toast.error(msg)
        return
      }
      toast.success(t('domainCreated'))
      setForm({ hostname: '', type: 'CUSTOM', appId: '', isPrimary: false })
      setDialogOpen(false)
      load()
    } catch (e) {
      toast.error(t('error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (domain: DomainItem) => {
    if (!confirm(t('confirmDomainDelete'))) return
    setActionLoading(domain.id)
    try {
      const res = await fetch(`/api/domains/${domain.id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error(t('error'))
        return
      }
      toast.success(t('domainDeleted'))
      load()
    } catch (e) {
      toast.error(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleSetPrimary = async (domain: DomainItem) => {
    setActionLoading(domain.id)
    try {
      const res = await fetch(`/api/domains/${domain.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true }),
      })
      if (!res.ok) {
        toast.error(t('error'))
        return
      }
      toast.success(t('saveSuccess'))
      load()
    } catch (e) {
      toast.error(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-64 bg-muted/30 rounded-lg animate-pulse" />
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
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('domains')}</h2>
            <p className="text-sm text-muted-foreground">{t('domainsDesc')}</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              {t('createDomain')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('createDomain')}</DialogTitle>
              <DialogDescription>{t('createDomainDesc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>{t('hostname')}</Label>
                <Input
                  value={form.hostname}
                  onChange={(e) => setForm({ ...form, hostname: e.target.value })}
                  placeholder="myapp.com أو myapp.up.railway.app"
                />
                <p className="text-[10px] text-muted-foreground">
                  بدون http:// أو https://
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t('domainType')}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOM">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" />
                        {t('customDomain')}
                      </div>
                    </SelectItem>
                    <SelectItem value="RAILWAY">
                      <div className="flex items-center gap-2">
                        <Rocket className="w-3.5 h-3.5" />
                        {t('railwayDomain')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('linkedApp')}</Label>
                <Select value={form.appId || '__panel__'} onValueChange={(v) => setForm({ ...form, appId: v === '__panel__' ? '' : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('panelDomain')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__panel__">{t('panelDomain')}</SelectItem>
                    {apps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={form.isPrimary}
                  onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
                <Label htmlFor="isPrimary" className="text-sm cursor-pointer">
                  {t('setPrimary')}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Plus className="w-4 h-4 me-2" />}
                {t('create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Railway Instructions Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-emerald-500/10 p-6"
      >
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold gradient-text-emerald">{t('railwayInstructions')}</h3>
              <p className="text-xs text-muted-foreground">{t('railwayInstructionsDesc')}</p>
            </div>
          </div>
          <ol className="space-y-2">
            {[t('railwayStep1'), t('railwayStep2'), t('railwayStep3'), t('railwayStep4'), t('railwayStep5')].map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-500 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </motion.div>

      {/* Port Configuration Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-border/40">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('currentPort')}</p>
                <p className="text-lg font-bold">8080</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">{t('portConfigDesc')}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/40">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('domains')}</p>
                <p className="text-lg font-bold">{domains.length}</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">{t('domainsDesc')}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/40">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">SSL</p>
                <p className="text-lg font-bold text-emerald-500">{t('active')}</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Auto-managed by Railway</p>
          </CardContent>
        </Card>
      </div>

      {/* Domains List */}
      {domains.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted/30 mb-4">
            <Globe className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('noDomains')}</h3>
          <p className="text-sm text-muted-foreground">{t('noDomainsDesc')}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {domains.map((domain, idx) => (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`glass-card border-border/40 relative overflow-hidden ${
                  domain.isPrimary ? 'ring-2 ring-amber-500/40' : ''
                }`}>
                  {domain.isPrimary && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          domain.type === 'RAILWAY' ? 'bg-cyan-500/15 text-cyan-500' : 'bg-emerald-500/15 text-emerald-500'
                        }`}>
                          {domain.type === 'RAILWAY' ? <Rocket className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base truncate">{domain.hostname}</CardTitle>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {domain.isPrimary && (
                              <Badge variant="outline" className="border-amber-500/50 text-amber-500 gap-1 text-[10px]">
                                <Crown className="w-2.5 h-2.5" />
                                {t('primaryDomain')}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px]">
                              {domain.type === 'RAILWAY' ? t('railwayDomain') : t('customDomain')}
                            </Badge>
                            {domain.sslStatus === 'ACTIVE' && (
                              <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 gap-1 text-[10px]">
                                <Shield className="w-2.5 h-2.5" />
                                SSL
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('linkedApp')}</span>
                      <span className="font-medium">
                        {domain.app ? domain.app.name : t('panelDomain')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('domainStatus')}</span>
                      {domain.status === 'ACTIVE' ? (
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {t('active')}
                        </Badge>
                      ) : domain.status === 'PENDING' ? (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-500 gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {t('deploying')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500/50 text-red-500 gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {t('error')}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 pt-2 border-t border-border/40">
                      <a
                        href={`https://${domain.hostname}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="ghost" size="sm" className="w-full gap-1.5 text-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/10">
                          <ExternalLink className="w-3.5 h-3.5" />
                          {t('visitDomain')}
                        </Button>
                      </a>
                      {!domain.isPrimary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                          onClick={() => handleSetPrimary(domain)}
                          disabled={actionLoading === domain.id}
                          title={t('setPrimary')}
                        >
                          {actionLoading === domain.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Star className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 w-9 h-9 p-0"
                        onClick={() => handleDelete(domain)}
                        disabled={actionLoading === domain.id}
                      >
                        {actionLoading === domain.id ? (
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
