import { Card, Typography, Box, Chip } from "@mui/material"
import LocalHospitalIcon from "@mui/icons-material/LocalHospital"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import { useTheme } from "@mui/material/styles"

const NextAppointmentCard = () => {
  const theme = useTheme()

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 4,
        boxShadow: theme.shadows[3],
        backgroundColor: theme.palette.background.paper,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <LocalHospitalIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="subtitle1" fontWeight={600}>
          Próxima Consulta
        </Typography>
        <Chip
          label="Confirmada"
          color="success"
          size="small"
          sx={{ ml: "auto", fontWeight: 500 }}
        />
      </Box>

      <Typography variant="body1" fontWeight={500}>
        Clínica Mais Saúde
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Avenida Paulista, 1234 • São Paulo
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AccessTimeIcon color="action" />
        <Typography variant="body2">Hoje às 14:00</Typography>
        <Chip
          label="4h restantes"
          size="small"
          sx={{
            ml: "auto",
            bgcolor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText,
            fontWeight: 600,
          }}
        />
      </Box>
    </Card>
  )
}

export default NextAppointmentCard
