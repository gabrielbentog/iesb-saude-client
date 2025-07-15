"use client"

import type React from "react"
import { useState, useRef } from "react"
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress"
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
  CircularProgress,
  Alert,
} from "@mui/material"
import { Visibility, VisibilityOff, School, ArrowBack } from "@mui/icons-material"
import { apiFetch } from "@/app/lib/api"
import { useToast } from "@/app/contexts/ToastContext";

export default function ForgotPasswordPage() {
  const theme = useTheme()
  const pushWithProgress = usePushWithProgress()
  const [step, setStep] = useState<"email" | "code" | "password">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState(["", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { showToast } = useToast();
  type PasteEvt = React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>;

  // Refs para os campos de código
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleClickShowPassword = () => setShowPassword(!showPassword)
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword)

  const handleSendCode = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await apiFetch("/api/auth/password", {
        method: "POST",
        body: JSON.stringify({ 
          email,
          redirect_url: `${window.location.origin}/auth/reset`
        }),
      })
      showToast({ message: "Código enviado para seu email!", severity: "success" })
      setStep("code")
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast({ message: "Erro ao enviar código: " + error.message, severity: "error" })
      } else {
        showToast({ message: "Erro ao enviar código: Erro desconhecido", severity: "error" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const distributeDigits = (startIndex: number, digits: string) => {
    const arr = [...code];

    // 1. zera a posição onde o usuário digitou / apagou
    arr[startIndex] = "";

    // 2. distribui eventuais dígitos (cola ou digitação rápida)
    digits.split("").forEach((d, i) => {
      if (startIndex + i < 5) arr[startIndex + i] = d;
    });

    setCode(arr);

    // 3. foco no próximo “vazio” ou no último campo
    const next = Math.min(startIndex + digits.length, 4);
    codeRefs.current[next]?.focus();
  };

  const handleCodeChange = (index: number, value: string) => {
    // remove qualquer coisa que não seja dígito
    value = value.replace(/\D/g, "");

    if (!value) {
      // apagou
      distributeDigits(index, "");
      return;
    }

    // se colou/digitou múltiplos dígitos aqui
    if (value.length > 1) {
      distributeDigits(index, value.slice(0, 5 - index));
    } else {
      // fluxo antigo (1 dígito)
      distributeDigits(index, value);
    }
  };

  const handleCodePaste = (e: PasteEvt, index: number) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!paste) return;
    distributeDigits(index, paste.slice(0, 5 - index));
  };

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    switch (e.key) {
      // ── Navegação ────────────────────────────────────────────
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        if (index > 0) codeRefs.current[index - 1]?.focus();
        break;

      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        if (index < 4) codeRefs.current[index + 1]?.focus();
        break;

      // ── Backspace/Delete ─────────────────────────────────────
      case "Backspace":
      case "Delete": {
        e.preventDefault();
        const arr = [...code];

        if (arr[index]) {
          // limpa o dígito atual
          arr[index] = "";
          setCode(arr);
        } else if (e.key === "Backspace" && index > 0) {
          // se já estava vazio, volta um campo (só Backspace)
          codeRefs.current[index - 1]?.focus();
        }
        break;
      }

      default:
        break;
    }
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault()
    const fullCode = code.join("")

    if (fullCode.length !== 5) {
      setError("Por favor, digite o código completo")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await apiFetch("/api/password/code_verify", {
        method: "POST",
        body: JSON.stringify({ email, code: fullCode }),
      })
      showToast({ message: "Código enviado para seu email!", severity: "success" })
      setStep("password")
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast({ message: "Código inválido" })
      } else {
        showToast({ message: "Erro desconhecido ao verificar código", severity: "error" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault()

    if (newPassword !== confirmPassword) {
      showToast({ message: "As senhas não coincidem", severity: "error" })
      return
    }

    if (newPassword.length < 8) {
      showToast({ message: "A senha deve ter pelo menos 8 caracteres", severity: "error" })
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await apiFetch("/api/auth/password", {
        method: "PUT",
        body: JSON.stringify({
          email,
          code: code.join(""),
          password: newPassword,
          passwordConfirmation: confirmPassword
        }),
      })
      showToast({ message: "Senha alterada com sucesso! Redirecionando...", severity: "success" })
      setTimeout(() => {
        pushWithProgress("/auth/login")
      }, 2000)
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast({ message: "Erro ao alterar senha: " + error.message, severity: "error" })
      } else {
        showToast({ message: "Erro ao alterar senha: Erro desconhecido", severity: "error" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const renderEmailStep = () => (
    <Box
      component="form"
      onSubmit={handleSendCode}
      sx={{
        width: "100%",
        maxWidth: 400,
        mx: "auto",
      }}
    >
      <Typography component="h2" variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Esqueceu sua senha?
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}>
        Digite seu email para receber um código de verificação
      </Typography>

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
        sx={{ mb: 3 }}
      />

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
        {isLoading ? <CircularProgress size={24} color="inherit" /> : "Enviar Código"}
      </Button>
    </Box>
  )

  const renderCodeStep = () => (
    <Box
      component="form"
      onSubmit={handleVerifyCode}
      sx={{
        width: "100%",
        maxWidth: 400,
        mx: "auto",
      }}
    >
      <Typography component="h2" variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Digite o código
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}>
        Enviamos um código de 5 dígitos para {email}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          mb: 3,
        }}
      >
        {code.map((digit, index) => (
          <TextField
            key={index}
            inputRef={(el) => (codeRefs.current[index] = el)}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleCodeKeyDown(index, e as React.KeyboardEvent<HTMLInputElement>)}
            inputProps={{
              maxLength: 1,
              onPaste: (e: PasteEvt) => handleCodePaste(e, index),
              style: { textAlign: "center", fontSize: "1.5rem", fontWeight: "bold" },
            }}
            sx={{
              width: 60,
              height: 60,
              "& .MuiOutlinedInput-root": {
                height: "100%",
              },
            }}
          />
        ))}
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{
          mt: 2,
          mb: 2,
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
        {isLoading ? <CircularProgress size={24} color="inherit" /> : "Verificar Código"}
      </Button>

      <Button
        fullWidth
        variant="text"
        onClick={() => setStep("email")}
        sx={{
          textTransform: "none",
          color: theme.palette.primary.main,
        }}
      >
        Reenviar código
      </Button>
    </Box>
  )

  const renderPasswordStep = () => (
    <Box
      component="form"
      onSubmit={handleResetPassword}
      sx={{
        width: "100%",
        maxWidth: 400,
        mx: "auto",
      }}
    >
      <Typography component="h2" variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Nova senha
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}>
        Digite sua nova senha
      </Typography>

      <TextField
        required
        fullWidth
        name="newPassword"
        label="Nova senha"
        type={showPassword ? "text" : "password"}
        id="newPassword"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
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
        label="Confirmar nova senha"
        type={showConfirmPassword ? "text" : "password"}
        id="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{ mb: 3 }}
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
        {isLoading ? <CircularProgress size={24} color="inherit" /> : "Alterar Senha"}
      </Button>
    </Box>
  )

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
              <School sx={{ color: theme.palette.primary.main, fontSize: 40, mr: 1 }} />
              <Typography component="h1" variant="h4" sx={{ color: theme.palette.primary.main }}>
                IESB SAÚDE
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {step === "email" && renderEmailStep()}
            {step === "code" && renderCodeStep()}
            {step === "password" && renderPasswordStep()}

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link
                href="/auth/login"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                <ArrowBack sx={{ mr: 1, fontSize: 16 }} />
                Voltar para o login
              </Link>
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
                Recuperar Senha
              </Typography>
              <Typography variant="body1">
                Siga os passos para redefinir sua senha de forma segura. Você receberá um código de verificação no seu
                email cadastrado.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  )
}
