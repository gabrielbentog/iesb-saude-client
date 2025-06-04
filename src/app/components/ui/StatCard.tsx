import React from "react";
import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { StatCardProps } from '@/app/types';

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor,
  trendComponent,
}) => {
  const theme = useTheme();
  const defaultIconBgColor = iconBgColor || alpha(theme.palette.primary.main, 0.1);

  return (
    <Card
      sx={{
        borderRadius: 1, // bordas suavemente arredondadas
        p: 2.5,
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        height: "100%",
        bgcolor: "background.paper",
      }}
    >

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        <Box
          sx={{
            width: 36,
            height: 36,
            bgcolor: defaultIconBgColor,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        {value}
      </Typography>

      {trendComponent ? (
        trendComponent
      ) : (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Card>
  );
};
