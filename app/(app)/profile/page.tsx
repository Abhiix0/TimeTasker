'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/lib/use-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { LogOut, User, Mail, Pencil } from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function useSimpleToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const show = (m: string, error = false) => {
    setMsg(m); setIsError(error)
    setTimeout(() => setMsg(null), 3500)
  }
  return { msg, isError, show }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const toast = useSimpleToast()

  const [displayName, setDisplayName] = useState('')
  const [savedName, setSavedName]     = useState('')
  const [firestoreLoading, setFirestoreLoading] = useState(true)
  const [saving, setSaving]           = useState(false)
  const [loggingOut, setLoggingOut]   = useState(false)

  // Load Firestore display name on mount
  useEffect(() => {
    if (!user) return
    // Seed input from Auth profile immediately
    const authName = user.displayName ?? ''
    setDisplayName(authName)
    setSavedName(authName)

    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        if (snap.exists()) {
          const name = snap.data().displayName as string | undefined
          if (name) { setDisplayName(name); setSavedName(name) }
        }
      })
      .catch(console.error)
      .finally(() => setFirestoreLoading(false))
  }, [user])

  const handleSave = async () => {
    if (!user) return
    const trimmed = displayName.trim()
    if (!trimmed) { toast.show('Display name cannot be empty.', true); return }
    if (trimmed === savedName) { toast.show('No changes to save.'); return }

    setSaving(true)
    try {
      const initials = deriveInitials(trimmed)
      await setDoc(doc(db, 'users', user.uid), { displayName: trimmed }, { merge: true })
      await setDoc(doc(db, 'leaderboard', user.uid), { displayName: trimmed, initials }, { merge: true })
      setSavedName(trimmed)
      toast.show('Display name updated.')
    } catch (e) {
      console.error('Profile save failed:', e)
      toast.show(e instanceof Error ? e.message : 'Failed to save. Try again.', true)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut(auth)
      router.replace('/login')
    } catch (e) {
      console.error('Sign-out failed:', e)
      toast.show('Sign-out failed. Try again.', true)
      setLoggingOut(false)
    }
  }

  // ── Loading states ────────────────────────────────────────────────────────
  if (authLoading || (user && firestoreLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!user) return null // AuthGuard in layout handles redirect

  const avatarUrl  = user.photoURL
  const initials   = deriveInitials(savedName || user.email || '?')
  const isDirty    = displayName.trim() !== savedName

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-lg mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account details.</p>
        </div>

        {/* Toast */}
        {toast.msg && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-200
            ${toast.isError
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'bg-card border-border text-foreground'
            }`}
          >
            {toast.msg}
          </div>
        )}

        {/* Avatar + identity card */}
        <Card className="p-8 border-border flex flex-col items-center gap-4 text-center">
          {/* Avatar */}
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={savedName || 'Profile photo'}
              className="w-24 h-24 rounded-full object-cover ring-2 ring-primary/30"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold ring-2 ring-primary/30">
              {initials}
            </div>
          )}

          <div>
            <p className="text-xl font-bold">{savedName || 'No name set'}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </Card>

        {/* Edit display name */}
        <Card className="p-6 border-border space-y-5">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-bold">Edit Profile</h2>
          </div>
          <Separator />

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <User className="w-3.5 h-3.5" /> Display Name
            </Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={40}
              disabled={saving}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              className="rounded-lg"
            />
            <p className="text-xs text-muted-foreground text-right">
              {displayName.length}/40
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <Mail className="w-3.5 h-3.5" /> Email
            </Label>
            <Input
              value={user.email ?? ''}
              disabled
              className="rounded-lg opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !isDirty || !displayName.trim()}
            className="rounded-full bg-linear-to-r from-primary to-accent hover:shadow-lg w-full sm:w-auto"
          >
            {saving ? <><Spinner className="mr-2" /> Saving…</> : 'Save Changes'}
          </Button>
        </Card>

        {/* Sign out */}
        <Card className="p-6 border-border space-y-4">
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-destructive" />
            <h2 className="text-lg font-bold">Sign Out</h2>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            You'll be redirected to the login page.
          </p>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-full gap-2"
          >
            {loggingOut
              ? <><Spinner className="mr-1" /> Signing out…</>
              : <><LogOut className="w-4 h-4" /> Sign Out</>
            }
          </Button>
        </Card>

      </div>
    </div>
  )
}
