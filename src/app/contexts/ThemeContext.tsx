'use client'

import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from '@/app/theme/theme'
import { useCurrentUser, updateSessionInStorage } from '@/app/hooks/useCurrentUser'

import type { ThemeContextProps } from '@/app/types'

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useThemeContext must be used inside ThemeProvider')
  return context
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [themePreference, setThemePreferenceState] = useState<'system' | 'light' | 'dark'>('system')

  const session = useCurrentUser()

  const toggleTheme = () => {
    // alterna light <-> dark e define preference explícita
    const next = !isDark
    setIsDark(next)
    const pref = next ? 'dark' : 'light'
    setThemePreferenceState(pref)
    try { window.localStorage.setItem('themePreference', pref) } catch {}
  if (session) updateSessionInStorage({ ...session, user: { ...session.user, themePreference: pref } })
  }

  const setThemePreference = (p: 'system' | 'light' | 'dark') => {
    setThemePreferenceState(p)
    if (p === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
    } else {
      setIsDark(p === 'dark')
    }
    try { window.localStorage.setItem('themePreference', p) } catch {}
  if (session) updateSessionInStorage({ ...session, user: { ...session.user, themePreference: p } })
  }

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark])

  useEffect(() => {
    // Garantir que o CssBaseline só seja aplicado no lado do cliente
    setMounted(true)

    try {
      const raw = window.localStorage.getItem('themePreference') as ('system'|'light'|'dark'|null)
      const userPref = session?.user?.themePreference as ('system'|'light'|'dark'|undefined)
      const pref = userPref ?? raw ?? 'system'
      setThemePreferenceState(pref)
      if (pref === 'system') {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDark(prefersDark)
      } else {
        setIsDark(pref === 'dark')
      }
    } catch {
      // ignore
    }
  }, [session])

  const providerValue: ThemeContextProps = {
    toggleTheme,
    isDark,
    themePreference,
    setThemePreference,
  }

  if (!mounted) {
    return <ThemeContext.Provider value={providerValue}>{children}</ThemeContext.Provider>
  }

  return (
    <ThemeContext.Provider value={providerValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
