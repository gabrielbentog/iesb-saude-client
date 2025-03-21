"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
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
import { useTheme } from "@mui/material/styles"
import { Visibility, VisibilityOff, School } from "@mui/icons-material"
import Image from "next/image"

export default function LoginPage() {
  const theme = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleClickShowPassword = () => setShowPassword(!showPassword)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (email && password) {
      const sessionData = {
        email,
        token: "dummy-token",
        loggedIn: true,
      }
      localStorage.setItem("session", JSON.stringify(sessionData))
      router.push("/home")
    }
  }

  return (
    <>
      <CssBaseline />
      <Container
        component="main"
        maxWidth="lg"
        sx={{ height: "100vh", display: "flex", alignItems: "center" }}
      >
        <Paper elevation={3} sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
          <Grid container>
            {/* Lado esquerdo - Formulário */}
            <Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 6 } }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                  <School sx={{ color: theme.palette.primary.main, fontSize: 40, mr: 1 }} />
                  <Typography component="h1" variant="h4" sx={{ color: theme.palette.primary.main }}>
                    IESB
                  </Typography>
                </Box>

                <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
                  Entrar na sua conta
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Senha"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ textAlign: "right", mb: 2 }}>
                    <Link href="#" variant="body2" sx={{ color: theme.palette.primary.main }}>
                      Esqueceu sua senha?
                    </Link>
                  </Box>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2, mb: 3, py: 1.5 }}
                  >
                    Entrar
                  </Button>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="body2">
                      Não tem uma conta?{" "}
                      <Link href="/auth/cadastro" variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                        Cadastre-se
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Lado direito - Ilustração e gradiente */}
            <Grid
              item
              xs={false}
              md={6}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                display: { xs: "none", md: "flex" },
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={{ p: 4, color: theme.palette.primary.contrastText, textAlign: "center", maxWidth: "80%", zIndex: 1 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                  Bem-vindo ao IESB
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
                  alt="IESB illustration"
                  layout="fill"
                  objectFit="cover"
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  )
}
