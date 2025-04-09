// Calendar.styles.ts (ou onde você definiu os styled components)
import { styled, TableCell, Box } from "@mui/material";

export const HeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  textAlign: "center",
  backgroundColor:
    theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[800],
  padding: theme.spacing(1.5),
  borderBottom: `2px solid ${theme.palette.divider}`,
}));

export const DayCell = styled(TableCell, {
  shouldForwardProp: (prop) =>
    prop !== "isCurrentMonth" && prop !== "isToday" && prop !== "isWeekend" && prop !== "hasEvents",
})<{
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  hasEvents: boolean;
}>(({ theme, isCurrentMonth, isToday, isWeekend, hasEvents }) => ({
  width: 130,
  height: 150, // Aumentei a altura de 100 para 150
  verticalAlign: "top",
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(0.5),
  cursor: "pointer",
  transition: "all 0.2s ease",
  position: "relative",
  backgroundColor: !isCurrentMonth
    ? theme.palette.mode === "light"
      ? theme.palette.grey[50]
      : theme.palette.grey[900]
    : isWeekend
    ? theme.palette.mode === "light"
      ? theme.palette.grey[50]
      : theme.palette.grey[900]
    : theme.palette.background.paper,

  ...(isToday && {
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor:
      theme.palette.mode === "light" ? theme.palette.primary.light : theme.palette.primary.dark,
  }),

  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },

  ...(hasEvents && {
    "&::after": {
      content: '""',
      position: "absolute",
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: theme.palette.primary.main,
      display: !isCurrentMonth ? "none" : "block",
    },
  }),
}));

export const DayNumber = styled("div", {
  shouldForwardProp: (prop) => prop !== "isToday" && prop !== "isCurrentMonth",
})<{ isToday: boolean; isCurrentMonth: boolean }>(({ theme, isToday, isCurrentMonth }) => ({
  fontWeight: isToday ? "bold" : isCurrentMonth ? "medium" : "normal",
  marginBottom: theme.spacing(0.5),
  display: "inline-block",
  width: 24,
  height: 24,
  lineHeight: "24px",
  textAlign: "center",
  borderRadius: "50%",
  ...(isToday && {
    backgroundColor: "transparent",
    color: theme.palette.primary.main,
  }),
  ...(!isCurrentMonth && {
    color: theme.palette.text.disabled,
  }),
}));

export const EventChip = styled(Box, {
  shouldForwardProp: (prop) => prop !== "color" && prop !== "isCurrentMonth",
})<{ color: string; isCurrentMonth: boolean }>(({ theme, color, isCurrentMonth }) => ({
  backgroundColor: color,
  color: theme.palette.getContrastText(color),
  borderRadius: 4,
  padding: "0 4px",
  fontSize: "0.75rem",
  lineHeight: 1.4,
  marginBottom: theme.spacing(0.4),
  maxWidth: "100%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  opacity: isCurrentMonth ? 1 : 0.5,
  transition: "all 0.2s ease",
  "&:hover": {
    opacity: 1,
    transform: "translateY(-1px)",
  },
}));
