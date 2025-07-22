"use client"

import type React from "react"
import { useCurrentUser } from "@/app/hooks/useCurrentUser"
import AppointmentDetail from "@/app/components/appointment/AppointmentDetail"
const AppointmentPage: React.FC = () => {
  const currentUser = useCurrentUser()
  return (
    <>
      <AppointmentDetail currentUser={currentUser} />
    </>
  )
}

export default AppointmentPage
