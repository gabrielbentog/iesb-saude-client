"use client"
import { ThemeProvider } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"
import { lightTheme } from "@/app/theme/theme"

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
