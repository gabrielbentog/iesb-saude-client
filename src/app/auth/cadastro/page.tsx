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
import { useTheme } from "@mui/material/styles"
import { Visibility, VisibilityOff, School, ArrowBack } from "@mui/icons-material"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/app/lib/api"

export default function RegisterPage() {
  const theme = useTheme()
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

  const handleClickShowPassword = () => setShowPassword(!showPassword)
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target
    const updatedValue = name === "agreeTerms" ? checked : value

    setFormData((prev) => ({ ...prev, [name]: updatedValue }))

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: value.length < 8 ? "A senha deve ter pelo menos 8 caracteres" : "",
      }))
    }

    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== formData.password ? "As senhas não coincidem" : "",
      }))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
  
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "As senhas não coincidem",
      }))
      return
    }
  
    try {
      const response = await apiFetch<{ user: object; token: string }>("/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            passwordConfirmation: formData.confirmPassword,
          }
        }),
      })

      localStorage.setItem("session", JSON.stringify({ user: response.user, loggedIn: true, token: response.token }))
  
      router.push("/home/paciente")
    } catch (error: any) {
      alert("Erro ao cadastrar: " + error.message)
    }
  }

  const goToLogin = () => router.push("/auth/login")

  return (
    <>
      <CssBaseline />
      <Container component="main" maxWidth="lg" sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
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
                  Criar uma nova conta
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
                  <TextField
                    required
                    fullWidth
                    id="name"
                    label="Nome completo"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={formData.name}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                  <TextField
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
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClickShowPassword} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
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
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClickShowConfirmPassword} edge="end">
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
                        <Link href="#" sx={{ color: theme.palette.primary.main }}>
                          Termos de Uso
                        </Link>{" "}
                        e{" "}
                        <Link href="#" sx={{ color: theme.palette.primary.main }}>
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

            {/* Lado direito - Ilustração */}
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
              <Box
                sx={{
                  p: 4,
                  color: theme.palette.primary.contrastText,
                  textAlign: "center",
                  maxWidth: "80%",
                  zIndex: 1,
                }}
              >
                <Typography variant="h4" component="h2" gutterBottom>
                  Junte-se ao IESB
                </Typography>
                <Typography variant="body1">
                  Crie sua conta para acessar todos os serviços acadêmicos, agendar atividades e acompanhar seu
                  histórico educacional em um só lugar.
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
                {/* <Image
                  src=""
                  alt="IESB illustration"
                  layout="fill"
                  objectFit="cover"
                /> */}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  )
}
