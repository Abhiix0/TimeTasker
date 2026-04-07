'use client'

import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  uid: string
  onComplete: (displayName: string, initials: string) => void
}

function deriveInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '??'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function ProfileSetupModal({ uid, onComplete }: Props) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter a display name.'); return }

    // Guard: uid must exist before writing to Firestore
    if (!uid) {
      setError('User not authenticated. Please sign in again.')
      return
    }

    setError(null)
    setSaving(true)

    const initials = deriveInitials(trimmed)

    console.log('ProfileSetup: saving started', { uid, trimmed, initials })

    try {
      // Write display name to user doc
      await setDoc(doc(db, 'users', uid), { displayName: trimmed }, { merge: true })
      console.log('ProfileSetup: users doc written')

      // Write leaderboard entry
      await setDoc(doc(db, 'leaderboard', uid), {
        displayName: trimmed,
        initials,
        weeklyFocusMinutes: 0,
        weeklySessions: 0,
        streak: 0,
        showOnLeaderboard: true,
      }, { merge: true })
      console.log('ProfileSetup: leaderboard doc written')

      // Signal parent to close modal
      onComplete(trimmed, initials)
      console.log('ProfileSetup: complete')
    } catch (e) {
      // Log the real error so it's visible in the console
      console.error('ProfileSetup: save failed', e)
      const message = e instanceof Error ? e.message : 'Unknown error'
      setError(`Failed to save: ${message}. Check the console for details.`)
    } finally {
      // Always reset saving — prevents the button getting stuck
      setSaving(false)
    }
  }

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome to Smart Time Tasker 👋</AlertDialogTitle>
          <AlertDialogDescription>
            Choose a display name. This is what other users will see on the leaderboard.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2 space-y-2">
          <Input
            placeholder="e.g. Alex Chen"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null) }}
            maxLength={40}
            disabled={saving}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <AlertDialogFooter>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="rounded-full"
          >
            {saving ? 'Saving…' : 'Get Started'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
