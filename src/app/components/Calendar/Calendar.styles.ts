// Calendar.styles.ts – indicador de eventos agora aparece na célula do dia
"use client";

import { styled } from "@mui/material/styles";
import { TableCell } from "@mui/material";

/* ---------- HEADER ---------- */
export const HeaderCell = styled(TableCell)({
  textAlign: "center",
  padding: "4px 2px",
  borderBottom: "2px solid rgba(0,0,0,0.12)",
  backgroundColor: "rgba(0,0,0,0.04)",
  fontWeight: 600,
});

/* ---------- CELULA DO MÊS ---------- */
interface DayProps {
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  hasEvents: boolean;
}

export const DayCell = styled(TableCell, {
  shouldForwardProp: (prop) =>
    !["isCurrentMonth", "isToday", "isWeekend", "hasEvents"].includes(prop as string),
})<DayProps>(({ theme, isCurrentMonth, isToday, isWeekend, hasEvents }) => ({
  position: "relative",
  verticalAlign: "top",
  height: 120,
  padding: 6,
  borderRight: `1px solid ${theme.palette.divider}`,
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: isToday
    ? theme.palette.action.selected
    : isWeekend
    ? theme.palette.action.hover
    : undefined,
  opacity: isCurrentMonth ? 1 : 0.4,
  "&:hover": hasEvents && { backgroundColor: theme.palette.action.hover },
  "&::after": hasEvents
    ? {
        content: '""',
        position: "absolute",
        top: 4,
        right: 4,
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: theme.palette.primary.main,
      }
    : {},
}));

/* ---------- NÚMERO DO DIA ---------- */
interface NumProps {
  isToday: boolean;
  isCurrentMonth: boolean;
}

export const DayNumber = styled("div", {
  shouldForwardProp: (prop) => !["isToday", "isCurrentMonth"].includes(prop as string),
})<NumProps>(({ theme, isToday }) => ({
  fontWeight: isToday ? 700 : 500,
  width: 24,
  height: 24,
  lineHeight: "24px",
  textAlign: "center",
  borderRadius: "50%",
  backgroundColor: isToday ? theme.palette.primary.main : undefined,
  color: isToday ? theme.palette.primary.contrastText : "inherit",
  marginBottom: 4,
  fontSize: "0.75rem",
}));

/* ---------- CHIP DE EVENTO ---------- */
interface ChipProps {
  color?: string;
  isCurrentMonth: boolean;
  past?: boolean;
}

export const EventChip = styled("span", {
  shouldForwardProp: (prop) => !["color", "isCurrentMonth", "past"].includes(prop as string),
})<ChipProps>(({ theme, color = theme.palette.grey[400], isCurrentMonth, past = false }) => {
  const bg = color;
  const fg = theme.palette.getContrastText(bg);

  return {
    backgroundColor: bg,
    color: fg,
    borderRadius: 4,
    padding: "0 4px",
    fontSize: "0.75rem",
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    opacity: isCurrentMonth ? 1 : 0.4,
    textDecoration: past ? "line-through" : "none",
    cursor: "pointer",
  };
});
