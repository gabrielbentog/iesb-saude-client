// src/context/ThemeContext.tsx
'use client'

import { createContext, useContext, useState, useMemo, ReactNode } from 'react'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from '@/app/theme/theme'

interface ThemeContextProps {
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useThemeContext must be used inside ThemeProvider')
  return context
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => setIsDark(prev => !prev)

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark])

  return (
    <ThemeContext.Provider value={{ toggleTheme, isDark }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
