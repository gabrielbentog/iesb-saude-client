"use client"

import React, { useState, useMemo } from "react"
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  useTheme,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Popper,
  Card,
  CardContent,
  CardActions,
  Badge,
  Divider,
  Grid,
  Tabs,
  Tab,
  useMediaQuery,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
} from "@mui/material"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isToday,
  addMonths,
  subMonths,
  isSameMonth,
  isWeekend,
} from "date-fns"
import { ptBR } from "date-fns/locale"

// Ícones
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import TodayIcon from "@mui/icons-material/Today"
import EventIcon from "@mui/icons-material/Event"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import PersonIcon from "@mui/icons-material/Person"
import FilterListIcon from "@mui/icons-material/FilterList"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth"
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek"
import CalendarViewDayIcon from "@mui/icons-material/CalendarViewDay"
import CloseIcon from "@mui/icons-material/Close"
import MedicalServicesIcon from "@mui/icons-material/MedicalServices"
import SchoolIcon from "@mui/icons-material/School"
import WorkIcon from "@mui/icons-material/Work"
import CelebrationIcon from "@mui/icons-material/Celebration"

type EventCategory = "medical" | "training" | "work" | "holiday"

interface CalendarEvent {
  id: string
  date: Date
  title: string
  description?: string
  location?: string
  category: EventCategory
  allDay?: boolean
  participants?: string[]
}

const categoryConfig: Record<EventCategory, { color: string; icon: React.ReactNode }> = {
  medical: { color: "#E50839", icon: <MedicalServicesIcon fontSize="small" /> },
  training: { color: "#2196F3", icon: <SchoolIcon fontSize="small" /> },
  work: { color: "#4CAF50", icon: <WorkIcon fontSize="small" /> },
  holiday: { color: "#FF9800", icon: <CelebrationIcon fontSize="small" /> },
}

// Exemplo de lista de eventos
const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    date: new Date(2025, 2, 19, 13, 0),
    title: "Plantão Ambulatório",
    description: "Plantão regular no ambulatório da Ala B",
    location: "Ambulatório - Ala B",
    category: "work",
    participants: ["Dr. Roberto Silva", "Enf. Maria Santos"],
  },
  {
    id: "2",
    date: new Date(2025, 2, 20, 9, 0),
    title: "Treinamento de Emergência",
    description: "Treinamento obrigatório sobre novos protocolos",
    location: "Sala de Treinamento 3",
    category: "training",
    participants: ["Equipe de Enfermagem"],
  },
  // ... você pode seguir com os demais
]

const HeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  textAlign: "center",
  backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[800],
  padding: theme.spacing(1.5),
  borderBottom: `2px solid ${theme.palette.divider}`,
}))

const DayCell = styled(TableCell, {
  shouldForwardProp: (prop) =>
    prop !== "isCurrentMonth" && prop !== "isToday" && prop !== "isWeekend" && prop !== "hasEvents",
})<{
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  hasEvents: boolean
}>(({ theme, isCurrentMonth, isToday, isWeekend, hasEvents }) => ({
  verticalAlign: "top",
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
  height: 120,
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
    backgroundColor: theme.palette.mode === "light" ? theme.palette.primary.light : theme.palette.primary.dark,
  }),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  ...(hasEvents && {
    "&::after": {
      content: '""',
      position: "absolute",
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: theme.palette.primary.main,
      display: !isCurrentMonth ? "none" : "block",
    },
  }),
}))

const DayNumber = styled("div", {
  shouldForwardProp: (prop) => prop !== "isToday" && prop !== "isCurrentMonth",
})<{ isToday: boolean; isCurrentMonth: boolean }>(({ theme, isToday, isCurrentMonth }) => ({
  fontWeight: isToday ? "bold" : isCurrentMonth ? "medium" : "normal",
  marginBottom: theme.spacing(0.5),
  display: "inline-block",
  width: 28,
  height: 28,
  lineHeight: "28px",
  textAlign: "center",
  borderRadius: "50%",
  ...(isToday && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  }),
  ...(!isCurrentMonth && {
    color: theme.palette.text.disabled,
  }),
}))

const EventChip = styled(Box, {
  shouldForwardProp: (prop) => prop !== "color" && prop !== "isCurrentMonth",
})<{ color: string; isCurrentMonth: boolean }>(({ theme, color, isCurrentMonth }) => ({
  backgroundColor: color,
  color: theme.palette.getContrastText(color),
  borderRadius: 4,
  padding: "2px 6px",
  marginBottom: theme.spacing(0.5),
  fontSize: "0.75rem",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
  opacity: isCurrentMonth ? 1 : 0.5,
  transition: "all 0.2s ease",
  "&:hover": {
    opacity: 1,
    transform: "translateY(-1px)",
  },
}))

// Componente principal do calendário
export default function EnhancedCalendar() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null)
  const [activeFilters, setActiveFilters] = useState<EventCategory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [eventPopperAnchorEl, setEventPopperAnchorEl] = useState<null | HTMLElement>(null)
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const calendarStart = startOfWeek(monthStart, { locale: ptBR })
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR })

  const dayMatrix = useMemo(() => {
    const matrix = []
    let tempDate = calendarStart
    while (tempDate <= calendarEnd) {
      const week = []
      for (let i = 0; i < 7; i++) {
        week.push(tempDate)
        tempDate = addDays(tempDate, 1)
      }
      matrix.push(week)
    }
    return matrix
  }, [currentMonth])

  const filteredEvents = sampleEvents.filter((event) => {
    const matchesFilter = activeFilters.length === 0 || activeFilters.includes(event.category)
    const matchesSearch =
      !searchTerm ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const getEventsForDay = (day: Date) =>
    filteredEvents.filter((event) => format(event.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))

  // Handlers
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const handleToday = () => setCurrentMonth(new Date())

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEvent(event)
  }

  const handleCloseEventDialog = () => setSelectedEvent(null)
  const handleCloseDateDialog = () => setSelectedDate(null)

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => setFilterAnchorEl(null)

  const handleFilterToggle = (category: EventCategory) => {
    setActiveFilters((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const handleClearFilters = () => {
    setActiveFilters([])
    setFilterAnchorEl(null)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleEventMouseEnter = (event: CalendarEvent, element: HTMLElement) => {
    setHoveredEvent(event)
    setEventPopperAnchorEl(element)
  }

  const handleEventMouseLeave = () => {
    setHoveredEvent(null)
    setEventPopperAnchorEl(null)
  }

  const handleViewModeChange = (event: React.SyntheticEvent, newValue: "month" | "week" | "day") => {
    setViewMode(newValue)
  }

  const weekDays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]

  const renderMonthView = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {weekDays.map((dayName) => (
              <HeaderCell key={dayName}>
                <Typography variant="subtitle2">{dayName}</Typography>
              </HeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dayMatrix.map((week, wIndex) => (
            <TableRow key={wIndex}>
              {week.map((day, dIndex) => {
                const isCurrent = isSameMonth(day, currentMonth)
                const dayEvents = getEventsForDay(day)
                const isWeekendDay = isWeekend(day)

                return (
                  <DayCell
                    key={dIndex}
                    isCurrentMonth={isCurrent}
                    isToday={isToday(day)}
                    isWeekend={isWeekendDay}
                    hasEvents={dayEvents.length > 0}
                    onClick={() => handleDayClick(day)}
                  >
                    <DayNumber isToday={isToday(day)} isCurrentMonth={isCurrent}>
                      {format(day, "d")}
                    </DayNumber>

                    {dayEvents.slice(0, 3).map((evt, i) => (
                      <EventChip
                        key={i}
                        color={categoryConfig[evt.category].color}
                        isCurrentMonth={isCurrent}
                        onClick={(e) => handleEventClick(evt, e)}
                        onMouseEnter={(e) => handleEventMouseEnter(evt, e.currentTarget)}
                        onMouseLeave={handleEventMouseLeave}
                      >
                        {evt.allDay ? evt.title : `${format(evt.date, "HH:mm")} ${evt.title}`}
                      </EventChip>
                    ))}

                    {dayEvents.length > 3 && (
                      <Typography variant="caption" sx={{ textAlign: "center", display: "block", mt: 0.5 }}>
                        + {dayEvents.length - 3} mais
                      </Typography>
                    )}
                  </DayCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  // Renderização da visualização semanal (simplificada)
  const renderWeekView = () => (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h6">Visualização Semanal</Typography>
      <Typography variant="body2" color="text.secondary">
        Em breve: Grade horária detalhada da semana.
      </Typography>
    </Box>
  )

  // Renderização da visualização diária (simplificada)
  const renderDayView = () => (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h6">Visualização Diária</Typography>
      <Typography variant="body2" color="text.secondary">
        Em breve: Agenda detalhada para o dia selecionado.
      </Typography>
    </Box>
  )

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ flexGrow: 1, my: 4 }}>
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold", flexGrow: 1 }}>
              Calendário
            </Typography>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Tabs
                value={viewMode}
                onChange={handleViewModeChange}
                sx={{
                  minHeight: 40,
                  display: { xs: "none", md: "flex" },
                  "& .MuiTab-root": {
                    minHeight: 40,
                    color: "primary.contrastText",
                    opacity: 0.7,
                    "&.Mui-selected": { opacity: 1 },
                  },
                }}
                TabIndicatorProps={{
                  style: { backgroundColor: theme.palette.primary.contrastText },
                }}
              >
                <Tab icon={<CalendarViewMonthIcon />} iconPosition="start" label="Mês" value="month" />
                {/* <Tab icon={<CalendarViewWeekIcon />} iconPosition="start" label="Semana" value="week" />
                <Tab icon={<CalendarViewDayIcon />} iconPosition="start" label="Dia" value="day" /> */}
              </Tabs>

              <IconButton color="inherit" onClick={handleFilterClick} sx={{ bgcolor: "rgba(255,255,255,0.1)" }}>
                <Badge badgeContent={activeFilters.length} color="error">
                  <FilterListIcon />
                </Badge>
              </IconButton>

              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
                PaperProps={{ elevation: 3, sx: { width: 250, maxWidth: "100%" } }}
              >
                <MenuItem disabled>
                  <Typography variant="subtitle2">Filtrar por categoria</Typography>
                </MenuItem>
                <Divider />
                {(Object.keys(categoryConfig) as EventCategory[]).map((category) => (
                  <MenuItem
                    key={category}
                    onClick={() => handleFilterToggle(category)}
                    selected={activeFilters.includes(category)}
                  >
                    <ListItemIcon sx={{ color: categoryConfig[category].color }}>
                      {categoryConfig[category].icon}
                    </ListItemIcon>
                    <ListItemText>{category.charAt(0).toUpperCase() + category.slice(1)}</ListItemText>
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem onClick={handleClearFilters}>
                  <ListItemIcon>
                    <CloseIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Limpar filtros</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Barra de navegação + busca */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={handlePrevMonth}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{ fontWeight: "medium", minWidth: 150, textTransform: "capitalize", textAlign: "center" }}
              >
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </Typography>
              <IconButton onClick={handleNextMonth}>
                <ChevronRightIcon />
              </IconButton>
              <Button
                variant="outlined"
                size="small"
                onClick={handleToday}
                startIcon={<TodayIcon />}
                sx={{ ml: 1 }}
              >
                Hoje
              </Button>
            </Box>

            <TextField
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              sx={{ width: { xs: "100%", sm: 250 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Calendário */}
          <Box sx={{ overflowX: "auto" }}>
            {viewMode === "month" && renderMonthView()}
            {viewMode === "week" && renderWeekView()}
            {viewMode === "day" && renderDayView()}
          </Box>

          {/* Legenda */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "center",
            }}
          >
            {(Object.keys(categoryConfig) as EventCategory[]).map((category) => (
              <Chip
                key={category}
                icon={categoryConfig[category].icon}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                sx={{
                  bgcolor: categoryConfig[category].color,
                  color: theme.palette.getContrastText(categoryConfig[category].color),
                  opacity: activeFilters.length > 0 && !activeFilters.includes(category) ? 0.5 : 1,
                }}
                onClick={() => handleFilterToggle(category)}
              />
            ))}
          </Box>
        </Paper>

        {/* Botão flutuante */}
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 16, right: 16, display: { xs: "flex", md: "none" } }}
          aria-label="Novo evento"
        >
          <AddIcon />
        </Fab>
      </Container>
    </>
  )
}
