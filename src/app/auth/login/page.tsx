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
} from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { Visibility, VisibilityOff, School } from "@mui/icons-material"
import Image from "next/image"

// Cria um tema customizado com a cor principal
const theme = createTheme({
  palette: {
    primary: {
      main: "#E50839", // Ajuste conforme a identidade visual do IESB Saúde, se necessário
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

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // Lógica de autenticação
    console.log("Tentativa de login com:", { email, password })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        component="main"
        maxWidth="lg"
        sx={{ height: "100vh", display: "flex", alignItems: "center" }}
      >
        <Paper elevation={3} sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
          <Grid container>
            {/* Lado esquerdo - Formulário de login */}
            <Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 6 } }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                  <School sx={{ color: "primary.main", fontSize: 40, mr: 1 }} />
                  <Typography component="h1" variant="h4" sx={{ color: "primary.main" }}>
                    IESB Saúde
                  </Typography>
                </Box>

                <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
                  Entrar na sua conta
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Senha"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  <Box sx={{ textAlign: "right", mt: 1, mb: 2 }}>
                    <Link href="#" variant="body2" sx={{ color: "primary.main" }}>
                      Esqueceu sua senha?
                    </Link>
                  </Box>
                  <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, mb: 3, py: 1.5 }}>
                    Entrar
                  </Button>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="body2">
                      Não tem uma conta?{" "}
                      <Link href="/auth/cadastro" variant="body2" sx={{ color: "primary.main", fontWeight: 600 }}>
                        Cadastre-se
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Lado direito - Imagem */}
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
                  Bem-vindo ao IESB Saúde
                </Typography>
                <Typography variant="body1">
                  Acesse sua conta para acompanhar sua jornada acadêmica e gerenciar suas informações.
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
                  alt="IESB Saúde illustration"
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
