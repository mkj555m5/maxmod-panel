'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Trash2, Ban, CheckCircle2, Edit, Users, Crown, Loader2 } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { toast } from 'sonner'

interface UserItem {
  id: string
  username: string
  role: string
  status: string
  package: any
  appsCount: number
  createdAt: string
}

interface PackageItem {
  id: string
  name: string
  displayName: string
  ramLimit: number
  diskLimit: number
  appLimit: number
  isUnlimited: boolean
  color: string
}

export default function UsersManager() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<UserItem[]>([])
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [form, setForm] = useState({ username: '', password: '', packageId: '' })
  const [editForm, setEditForm] = useState({ packageId: '', status: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const [u, p] = await Promise.all([
        fetch('/api/users').then((r) => r.json()),
        fetch('/api/packages').then((r) => r.json()),
      ])
      if (u.users) setUsers(u.users)
      if (p.packages) setPackages(p.packages)
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
    if (!form.username || !form.password) {
      toast.error(t('usernameRequired'))
      return
    }
    if (form.password.length < 6) {
      toast.error(t('passwordMin'))
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          packageId: form.packageId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error === 'username_exists' ? t('usernameExists') : t('error'))
        return
      }
      toast.success(t('createSuccess'))
      setForm({ username: '', password: '', packageId: '' })
      setDialogOpen(false)
      load()
    } catch (e) {
      toast.error(t('error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (user: UserItem) => {
    setEditingUser(user)
    setEditForm({
      packageId: user.package?.id || '',
      status: user.status,
      password: '',
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    setSubmitting(true)
    try {
      const body: any = {
        status: editForm.status,
      }
      if (editForm.packageId) body.packageId = editForm.packageId
      if (editForm.password) body.password = editForm.password

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        toast.error(t('error'))
        return
      }
      toast.success(t('saveSuccess'))
      setEditDialogOpen(false)
      setEditingUser(null)
      load()
    } catch (e) {
      toast.error(t('error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (user: UserItem) => {
    if (!confirm(t('confirmDelete'))) return
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error(t('error'))
        return
      }
      toast.success(t('deleteSuccess'))
      load()
    } catch (e) {
      toast.error(t('error'))
    }
  }

  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        toast.error(t('error'))
        return
      }
      toast.success(t('saveSuccess'))
      load()
    } catch (e) {
      toast.error(t('error'))
    }
  }

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  )

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center glow-emerald">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('users')}</h2>
            <p className="text-sm text-muted-foreground">{users.length} {t('users').toLowerCase()}</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              {t('createUser')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('createUser')}</DialogTitle>
              <DialogDescription>{t('createUserDesc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>{t('username')}</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="username"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('password')}</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('selectPackage')}</Label>
                <Select value={form.packageId} onValueChange={(v) => setForm({ ...form, packageId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPackage')} />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          {p.isUnlimited && <Crown className="w-3.5 h-3.5 text-fuchsia-500" />}
                          {p.displayName}
                          {p.isUnlimited && (
                            <Badge variant="outline" className="text-[9px] border-fuchsia-500/50 text-fuchsia-500">
                              GOD
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                {t('create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search')}
          className="ps-9 bg-background/50"
        />
      </div>

      {/* Users table */}
      <Card className="glass-card border-border/40">
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="ps-4">{t('username')}</TableHead>
                  <TableHead>{t('role')}</TableHead>
                  <TableHead>{t('package')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('applications')}</TableHead>
                  <TableHead className="pe-4 text-end">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('noData')}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-border/40 hover:bg-accent/40"
                  >
                    <TableCell className="ps-4 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        {user.username}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role === 'OWNER' ? (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-500 gap-1">
                          <Crown className="w-3 h-3" />
                          {t('owner')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          {t('user')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.package ? (
                        <div className="flex items-center gap-1.5">
                          {user.package.isUnlimited && <Crown className="w-3.5 h-3.5 text-fuchsia-500" />}
                          <span className="text-sm">{user.package.displayName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t('noPackage')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.status === 'ACTIVE' ? (
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {t('active')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500/50 text-red-500 gap-1">
                          {t('suspended')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{user.appsCount}</span>
                    </TableCell>
                    <TableCell className="pe-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(user)}
                          title={t('edit')}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === 'ACTIVE' ? t('suspendUser') : t('activateUser')}
                        >
                          {user.status === 'ACTIVE' ? (
                            <Ban className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </Button>
                        {user.role !== 'OWNER' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => handleDelete(user)}
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editUser')}</DialogTitle>
            <DialogDescription>{editingUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t('selectPackage')}</Label>
              <Select value={editForm.packageId} onValueChange={(v) => setEditForm({ ...editForm, packageId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectPackage')} />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        {p.isUnlimited && <Crown className="w-3.5 h-3.5 text-fuchsia-500" />}
                        {p.displayName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('status')}</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">{t('active')}</SelectItem>
                  <SelectItem value="SUSPENDED">{t('suspended')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('password')} ({t('password')})</Label>
              <Input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
