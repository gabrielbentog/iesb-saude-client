"use client";

import type React from "react";
import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  InputAdornment,
  IconButton,
  CssBaseline,
  Checkbox,
  FormControlLabel,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  School,
  ArrowBack,
} from "@mui/icons-material";
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
import { apiFetch } from "@/app/lib/api";
import Cookies from "js-cookie";

export default function RegisterPage() {
  const theme = useTheme();
  const pushWithProgress = usePushWithProgress();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;
    const updatedValue = name === "agreeTerms" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: updatedValue }));

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password:
          value.length < 8 ? "A senha deve ter pelo menos 8 caracteres" : "",
      }));
    }

    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== formData.password ? "As senhas não coincidem" : "",
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "As senhas não coincidem",
      }));
      return;
    }

    try {
      const response = await apiFetch<{
        user: { profile: { name: string } };
        token: string;
      }>("/api/users", {
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
          },
        }),
      });

      localStorage.setItem(
        "session",
        JSON.stringify({
          user: response.user,
          loggedIn: true,
          token: response.token,
        })
      );
      Cookies.set(
        "session",
        JSON.stringify({
          token: response.token,
          profile: response.user?.profile.name,
        }),
        { expires: 7, secure: true }
      );

      pushWithProgress("paciente/dashboard");
    } catch (error: any) {
      alert("Erro ao cadastrar: " + error.message);
    }
  };

  const goToLogin = () => pushWithProgress("/auth/login");

  return (
    <>
      <CssBaseline />
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            borderRadius: 2,
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          {/* Lado Esquerdo - Formulário */}
          <Box
            sx={{
              p: { xs: 3, md: 6 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: theme.shadows[2],
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 4,
                justifyContent: "center",
              }}
            >
              <School
                sx={{ color: theme.palette.primary.main, fontSize: 40, mr: 1 }}
              />
              <Typography
                component="h1"
                variant="h4"
                sx={{ color: theme.palette.primary.main }}
              >
                IESB
              </Typography>
            </Box>

            <Typography
              component="h2"
              variant="h5"
              sx={{ mb: 3, textAlign: "center" }}
            >
              Criar uma nova conta
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                width: "100%",
                maxWidth: 400,
                mx: "auto",
              }}
            >
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
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
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
                      <IconButton
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                        aria-label="toggle confirm password visibility"
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
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: "none",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[3],
                  },
                }}
                disabled={
                  !formData.agreeTerms ||
                  !!errors.password ||
                  !!errors.confirmPassword
                }
              >
                Cadastrar
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={goToLogin}
                sx={{
                  mb: 2,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: "none",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[2],
                  },
                }}
              >
                Voltar para o login
              </Button>
            </Box>
          </Box>

          {/* Lado Direito - Ilustração / Background */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
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
                Crie sua conta para acessar todos os serviços acadêmicos,
                agendar atividades e acompanhar seu histórico educacional
                em um só lugar.
              </Typography>
            </Box>

            {/* Exemplo de imagem ou pattern de fundo (opcional)
                <Box
                  sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    opacity: 0.2,
                  }}
                >
                  <Image
                    src="/iesb_illustration.png"
                    alt="IESB illustration"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </Box>
            */}
          </Box>
        </Paper>
      </Container>
    </>
  );
}
