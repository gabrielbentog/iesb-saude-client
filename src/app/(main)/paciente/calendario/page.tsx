// app/page.tsx
"use client";

import React from "react";
import EnhancedCalendar from "@/app/components/Calendar/EnhancedCalendar";

export default function Calendar() {
  return (
    <main>
      <EnhancedCalendar showScheduleButton={false} userProfile={"paciente"} />
    </main>
  );
}
