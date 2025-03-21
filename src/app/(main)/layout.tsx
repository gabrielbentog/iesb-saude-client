"use client"

import React, { useState } from "react"
import Box from "@mui/material/Box"
import Sidebar from "@/app/components/Sidebar"
import Header from "@/app/components/Header"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)

  const toggleSidebar = () => {
    setOpen((prev) => !prev)
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ width: open ? 240 : 64, transition: "width 0.3s", flexShrink: 0 }}>
        <Sidebar open={open} onClose={toggleSidebar} />
      </Box>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* <Header onToggleSidebar={toggleSidebar} /> */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
