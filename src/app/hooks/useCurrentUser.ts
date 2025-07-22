import { useEffect, useState } from "react"

interface SessionSchema {
  user: {
    id: string
    name: string
    email: string
    profile: { id: string; name: string }
  }
  token: string       // "Bearer …"
  loggedIn: boolean
}

export function useCurrentUser() {
  const [session, setSession] = useState<SessionSchema | null>(null)

  useEffect(() => {
    // roda só no cliente
    const raw = window.localStorage.getItem("session")
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as SessionSchema
      if (parsed.loggedIn) setSession(parsed)
    } catch {
      // JSON inválido → remove para evitar loops
      window.localStorage.removeItem("session")
    }
  }, [])

  return session          // null enquanto carrega / não logado
}
