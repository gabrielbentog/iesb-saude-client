// CalendarHeader.tsx
"use client";

import React from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  IconButton, 
  Button,
  Menu, 
  MenuItem, 
  Divider, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { EventCategory } from '@/app/components/Calendar/types';

interface CalendarHeaderProps {
  title: string;
  viewMode: "month" | "week" | "day";
  dateDisplay: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (newMode: "month" | "week" | "day") => void;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  filterAnchorEl: null | HTMLElement;
  onFilterClick: (event: React.MouseEvent<HTMLElement>) => void;
  onFilterClose: () => void;
  activeFilters: string[];
  onFilterToggle: (category: EventCategory) => void;
  onClearFilters: () => void;
  categoryConfig: Record<string, { color: string; icon: React.ReactNode }>;
  // Novas props para o botão de agendar horário:
  showScheduleButton?: boolean;
  onScheduleClick?: () => void;
}

export function CalendarHeader({
  title,
  viewMode,
  dateDisplay,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
  filterAnchorEl,
  onFilterClick,
  onFilterClose,
  activeFilters,
  onFilterToggle,
  onClearFilters,
  categoryConfig,
  showScheduleButton = false,
  onScheduleClick,
}: CalendarHeaderProps) {
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
      {/* Parte esquerda: título, abas e filtro */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>
        <Tabs
          value={viewMode}
          onChange={(_, newValue) => onViewModeChange(newValue)}
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: "#fff" } }}
          sx={{
            minHeight: 40,
            "& .MuiTab-root": {
              minHeight: 40,
              color: "primary.contrastText",
              opacity: 0.7,
              "&.Mui-selected": { opacity: 1 },
            },
          }}
        >
          <Tab icon={<CalendarViewMonthIcon />} iconPosition="start" label="Mês" value="month" />
          <Tab icon={<CalendarViewWeekIcon />} iconPosition="start" label="Semana" value="week" />
          <Tab icon={<CalendarViewDayIcon />} iconPosition="start" label="Dia" value="day" />
        </Tabs>
        <IconButton color="inherit" onClick={onFilterClick} sx={{ bgcolor: "rgba(255,255,255,0.1)" }}>
          <FilterListIcon />
        </IconButton>
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={onFilterClose}
          PaperProps={{ elevation: 3, sx: { width: 250, maxWidth: "100%" } }}
        >
          <MenuItem disabled>
            <Typography variant="subtitle2">Filtrar por categoria</Typography>
          </MenuItem>
          <Divider />
          {Object.keys(categoryConfig).map((category) => (
            <MenuItem
              key={category}
              onClick={() => onFilterToggle(category as EventCategory)}
              selected={activeFilters.includes(category)}
            >
              <ListItemIcon sx={{ color: categoryConfig[category].color }}>
                {categoryConfig[category].icon}
              </ListItemIcon>
              <ListItemText>{category.charAt(0).toUpperCase() + category.slice(1)}</ListItemText>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={onClearFilters}>
            <ListItemIcon>
              <CloseIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Limpar filtros</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Parte direita: navegação, data, botão "Hoje" e campo de busca ou botão de agendar horário */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: { xs: "wrap", md: "nowrap" } }}>
        <IconButton onClick={onPrev} color="inherit">
          <ChevronLeftIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "medium",
            minWidth: 200,
            textTransform: "capitalize",
            textAlign: "center",
          }}
        >
          {dateDisplay}
        </Typography>
        <IconButton onClick={onNext} color="inherit">
          <ChevronRightIcon />
        </IconButton>
        <Button
          variant="contained"
          size="small"
          onClick={onToday}
          startIcon={<TodayIcon />}
          sx={{
            ml: 1,
            backgroundColor: "rgba(255,255,255,0.3)",
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.5)",
            },
          }}
        >
          Hoje
        </Button>
        {showScheduleButton && (
          <Button
            variant="contained"
            size="small"
            onClick={onScheduleClick}
            startIcon={<ScheduleIcon />}
            sx={{
              ml: 1,
              backgroundColor: "secondary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "secondary.dark",
              },
            }}
          >
            Agendar horário
          </Button>
        )}
      </Box>
    </Box>
  );
}
