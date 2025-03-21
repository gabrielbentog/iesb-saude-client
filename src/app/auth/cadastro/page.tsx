"use client"

import type React from "react"

import { useState } from "react"
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  CssBaseline,
  Checkbox,
  FormControlLabel,
} from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { Visibility, VisibilityOff, HealthAndSafety, ArrowBack } from "@mui/icons-material"
import Image from "next/image"
import { useRouter } from "next/navigation"

// Create a custom theme with the E50839 color
const theme = createTheme({
  palette: {
    primary: {
      main: "#E50839",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          padding: "10px 24px",
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: 16,
        },
      },
    },
  },
})

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  })

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target
    setFormData({
      ...formData,
      [name]: name === "agreeTerms" ? checked : value,
    })

    // Password validation
    if (name === "password") {
      if (value.length < 8) {
        setErrors({ ...errors, password: "A senha deve ter pelo menos 8 caracteres" })
      } else {
        setErrors({ ...errors, password: "" })
      }
    }

    // Confirm password validation
    if (name === "confirmPassword") {
      if (value !== formData.password) {
        setErrors({ ...errors, confirmPassword: "As senhas não coincidem" })
      } else {
        setErrors({ ...errors, confirmPassword: "" })
      }
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ ...errors, confirmPassword: "As senhas não coincidem" })
      return
    }

    // Handle registration logic here
    console.log("Registration attempt with:", formData)

    // Redirect to login page after successful registration
    // router.push('/')
  }

  const goToLogin = () => {
    router.push("/auth/login")
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="lg" sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
        <Paper elevation={3} sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
          <Grid container>
            {/* Left side - Registration Form */}
            <Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 6 } }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                  <HealthAndSafety sx={{ color: "primary.main", fontSize: 40, mr: 1 }} />
                  <Typography component="h1" variant="h4" sx={{ color: "primary.main" }}>
                    HealthCare
                  </Typography>
                </Box>

                <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
                  Criar uma nova conta
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Nome completo"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Senha"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirmar senha"
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowConfirmPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="agreeTerms"
                        color="primary"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        required
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ display: "inline" }}>
                        Eu concordo com os{" "}
                        <Link href="#" sx={{ color: "primary.main" }}>
                          Termos de Uso
                        </Link>{" "}
                        e{" "}
                        <Link href="#" sx={{ color: "primary.main" }}>
                          Política de Privacidade
                        </Link>
                      </Typography>
                    }
                    sx={{ mt: 2 }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                    disabled={!formData.agreeTerms || !!errors.password || !!errors.confirmPassword}
                  >
                    Cadastrar
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={goToLogin}
                    sx={{ mb: 2, py: 1.5 }}
                  >
                    Voltar para o login
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Right side - Image */}
            <Grid
              item
              xs={false}
              md={6}
              sx={{
                background: "linear-gradient(135deg, #E50839 0%, #C4072E 100%)",
                display: { xs: "none", md: "flex" },
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={{ p: 4, color: "white", textAlign: "center", maxWidth: "80%", zIndex: 1 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                  Junte-se a nós
                </Typography>
                <Typography variant="body1">
                  Crie sua conta para acessar todos os serviços de saúde, agendar consultas e acompanhar seu histórico
                  médico em um só lugar.
                </Typography>
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  opacity: 0.2,
                }}
              >
                <Image
                  src="/placeholder.svg?height=600&width=600"
                  alt="Healthcare illustration"
                  layout="fill"
                  objectFit="cover"
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </ThemeProvider>
  )
}

