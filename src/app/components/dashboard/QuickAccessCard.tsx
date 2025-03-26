import { Button, Card, Typography, Box } from "@mui/material"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import { useTheme } from "@mui/material/styles"

const QuickAccessCard = () => {
  const theme = useTheme()

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 4,
        boxShadow: theme.shadows[3],
        backgroundColor: theme.palette.background.paper,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <CalendarMonthIcon color="secondary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight={600}>
            Acesso Rápido
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Visualize e gerencie suas consultas com facilidade através do calendário interativo.
        </Typography>
      </Box>

      <Button
        startIcon={<CalendarMonthIcon />}
        variant="outlined"
        sx={{
          mt: 3,
          borderRadius: 2,
          textTransform: "none",
          color: theme.palette.secondary.main,
          borderColor: theme.palette.secondary.main,
          "&:hover": {
            borderColor: theme.palette.secondary.dark,
            color: theme.palette.secondary.dark,
          },
        }}
        aria-label="Ver Calendário"
      >
        Ver Calendário
      </Button>
    </Card>
  )
}

export default QuickAccessCard
