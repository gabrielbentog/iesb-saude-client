
import { useEffect, useState } from "react"

interface SessionSchema {
  user: {
    id: string
    name: string
    email: string
    profile: { id: string; name: string }
    // opcional, pode vir do backend
    themePreference?: 'system' | 'light' | 'dark'
  }
  token: string       // "Bearer …"
  loggedIn: boolean
}

export function updateSessionInStorage(nextSession: unknown) {
  try {
    window.localStorage.setItem('session', JSON.stringify(nextSession))
  } catch {}
  window.dispatchEvent(new Event('sessionUpdated'))
}

export function useCurrentUser() {
  const [session, setSession] = useState<SessionSchema | null>(null)

  const readSession = () => {
    try {
      const raw = window.localStorage.getItem('session')
      if (!raw) {
        setSession(null)
        return
      }
      const parsed = JSON.parse(raw) as SessionSchema
      if (parsed.loggedIn) setSession(parsed)
      else setSession(null)
    } catch {
      window.localStorage.removeItem('session')
      setSession(null)
    }
  }

  useEffect(() => {
    readSession()
    const onUpdate = () => readSession()
    window.addEventListener('sessionUpdated', onUpdate)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'session') readSession()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('sessionUpdated', onUpdate)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return session
}
