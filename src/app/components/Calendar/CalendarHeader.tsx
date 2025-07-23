"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Button,
  Badge,
  Drawer,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Chip,
  Stack,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import FilterListIcon from "@mui/icons-material/FilterList";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import CalendarViewDayIcon from "@mui/icons-material/CalendarViewDay";
import type { CalendarHeaderProps } from '@/app/types';


export function CalendarHeader({
  /* navegação */
  title,
  viewMode,
  dateDisplay,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
  /* filtros */
  campusList,
  specialtyList,
  campusFilters,
  specialtyFilters,
  onToggleCampus,
  onToggleSpecialty,
  onClearFilters,
  /* CTA */
  showScheduleButton = false,
  onScheduleClick,
}: CalendarHeaderProps) {
  /* drawer + tabs + busca */
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<0 | 1>(0);
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const totalActive = campusFilters.length + specialtyFilters.length;

  /* filtra lista localmente */
  const textMatch = React.useCallback(
    (v: string) => v.toLowerCase().includes(search.toLowerCase()),
    [search]
  );
  const campusFiltered = useMemo(() => campusList.filter(textMatch), [campusList, textMatch]);
  const specialtyFiltered = useMemo(() => specialtyList.filter(textMatch), [specialtyList, textMatch]);

  /* chips ativos */
  const activeChips = [...campusFilters, ...specialtyFilters];

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      {/* ---------- ESQUERDA ---------- */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>

        <Tabs
          value={viewMode}
          onChange={(_, v) => onViewModeChange(v)}
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: "#fff" } }}
          sx={{ "& .MuiTab-root": { minHeight: 36 } }}
        >
          <Tab icon={<CalendarViewMonthIcon />} value="month" label="Mês" />
          <Tab icon={<CalendarViewWeekIcon />} value="week" label="Semana" />
          <Tab icon={<CalendarViewDayIcon />} value="day" label="Dia" />
        </Tabs>

        <IconButton
          color="inherit"
          sx={{ bgcolor: "rgba(255,255,255,0.15)" }}
          onClick={() => setOpen(true)}
        >
          <Badge color="secondary" badgeContent={totalActive} invisible={totalActive === 0}>
            <FilterListIcon />
          </Badge>
        </IconButton>

        {/* chips */}
        <Stack direction="row" spacing={1} sx={{ maxWidth: 300, overflowX: "auto" }}>
          {activeChips.map((c) => (
            <Chip
              key={c}
              label={c}
              size="small"
              onDelete={() =>
                campusFilters.includes(c) ? onToggleCampus(c) : onToggleSpecialty(c)
              }
              sx={{ bgcolor: "rgba(255,255,255,0.25)", color: "white" }}
            />
          ))}
        </Stack>
      </Box>

      {/* ---------- DIREITA ---------- */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={onPrev} color="inherit">
          <ChevronLeftIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{ minWidth: 200, textAlign: "center", textTransform: "capitalize" }}
        >
          {dateDisplay}
        </Typography>

        <IconButton onClick={onNext} color="inherit">
          <ChevronRightIcon />
        </IconButton>

        <Button variant="contained" size="small" onClick={onToday} startIcon={<TodayIcon />}>
          Hoje
        </Button>

        {showScheduleButton && (
          <Button
            variant="contained"
            size="small"
            onClick={onScheduleClick}
            startIcon={<ScheduleIcon />}
            sx={{ whiteSpace: "nowrap" }}
          >
            Agendar
          </Button>
        )}
      </Box>

      {/* ---------- DRAWER ---------- */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: fullScreen ? "100%" : 320,
            p: 2,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Filtros
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
          <Tab label={`Campus (${campusFilters.length})`} />
          <Tab label={`Especialidade (${specialtyFilters.length})`} />
        </Tabs>

        <TextField
          size="small"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 1 }}
        />

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {tab === 0 && (
            <List dense>
              {campusFiltered.map((c) => (
                <ListItem key={c} disablePadding>
                  <ListItemButton onClick={() => onToggleCampus(c)} dense>
                    <ListItemText primary={c} />
                    <Checkbox
                      edge="end"
                      checked={campusFilters.includes(c)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {campusFiltered.length === 0 && (
                <Typography variant="body2" sx={{ textAlign: "center", mt: 4 }}>
                  Nada encontrado
                </Typography>
              )}
            </List>
          )}

          {tab === 1 && (
            <List dense>
              {specialtyFiltered.map((s) => (
                <ListItem key={s} disablePadding>
                  <ListItemButton onClick={() => onToggleSpecialty(s)} dense>
                    <ListItemText primary={s} />
                    <Checkbox
                      edge="end"
                      checked={specialtyFilters.includes(s)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {specialtyFiltered.length === 0 && (
                <Typography variant="body2" sx={{ textAlign: "center", mt: 4 }}>
                  Nada encontrado
                </Typography>
              )}
            </List>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={onClearFilters}>Limpar</Button>
          <Button variant="contained" onClick={() => setOpen(false)}>
            Aplicar
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
