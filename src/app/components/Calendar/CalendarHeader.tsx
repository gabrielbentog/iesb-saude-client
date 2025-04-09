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
  TextField, 
  InputAdornment, 
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
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
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
}

export function CalendarHeader({
  title,
  viewMode,
  dateDisplay,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
  searchTerm,
  onSearchChange,
  onClearSearch,
  filterAnchorEl,
  onFilterClick,
  onFilterClose,
  activeFilters,
  onFilterToggle,
  onClearFilters,
  categoryConfig,
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

      {/* Parte direita: navegação, data, botão "Hoje" e busca */}
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
          variant="outlined"
          size="small"
          onClick={onToday}
          startIcon={<TodayIcon sx={{ color: "white" }} />}
          sx={{
            ml: 1,
            borderColor: "#fff",
            color: "#fff",
            "&:hover": {
              borderColor: "#fff",
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          Hoje
        </Button>
        <TextField
          placeholder="Buscar eventos..."
          value={searchTerm}
          onChange={onSearchChange}
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
                <IconButton size="small" onClick={onClearSearch}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
