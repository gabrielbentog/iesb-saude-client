"use client";

import React, { useState } from "react";
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
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
  useTheme,
  CircularProgress
} from "@mui/material";
import { Visibility, VisibilityOff, School } from "@mui/icons-material";
import { apiFetch } from "@/app/lib/api";
import Cookies from "js-cookie";

export default function LoginPage() {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const pushWithProgress = usePushWithProgress();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiFetch<{ token: string; user: { profile: { name: string } } }>(
        "/api/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );

      const sessionData = {
        user: response.user,
        token: response.token,
        loggedIn: true,
      };

      localStorage.setItem("session", JSON.stringify(sessionData));
      Cookies.set(
        "session",
        JSON.stringify({
          token: sessionData?.token,
          profile: sessionData?.user?.profile?.name,
        }),
        { expires: 7, secure: true }
      );

      const sanitizedProfileName = response.user.profile.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      pushWithProgress(`/${sanitizedProfileName}/dashboard`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("Erro no login: " + error.message);
      } else {
        alert("Erro no login: Erro desconhecido");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Coluna Esquerda - Formulário */}
          <Box
            sx={{
              p: { xs: 3, md: 6 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: theme.shadows[1],
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
                IESB SAÚDE
              </Typography>
            </Box>

            <Typography
              component="h2"
              variant="h5"
              sx={{ mb: 3, textAlign: "center" }}
            >
              Entrar na sua conta
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
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ textAlign: "right", mb: 2 }}>
                <Link href="/auth/esqueci-a-senha" variant="body2" sx={{ color: theme.palette.primary.main }}>
                  Esqueceu sua senha?
                </Link>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 2,
                  mb: 3,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[3],
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Entrar"
                )}
              </Button>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2">
                  Não tem uma conta?{" "}
                  <Link
                    href="/auth/cadastro"
                    variant="body2"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    }}
                  >
                    Cadastre-se
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Coluna Direita - Gradiente e Ilustração */}
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
                Bem-vindo!
              </Typography>
              <Typography variant="body1">
                Acesse sua conta para marcar consultas, acompanhar seu histórico 
                de atendimentos e gerenciar seus compromissos de forma prática e segura.
              </Typography>
            </Box>

            {/* <Box
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                opacity: 0.2,
              }}
            >
              <Image
                src="/"
                alt="IESB illustration"
                fill
                style={{ objectFit: "cover" }}
              />
            </Box> */}
          </Box>
        </Paper>
      </Container>
    </>
  );
}
