"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  styled,
  alpha,
  keyframes,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  LockReset,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useRouter } from "next/navigation";
import LoadingIn from "../hooks/LoadingIn";

// Animation pulse
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const Root = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.light,
    0.1
  )} 0%, ${alpha(
    theme.palette.secondary.light,
    0.1
  )} 100%), center/cover no-repeat`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(3),
}));

const AuthCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  width: "100%",
  borderRadius: 24,
  boxShadow: theme.shadows[12],
  transition: "transform 0.4s ease, box-shadow 0.4s ease",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[20],
  },
}));

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const API = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);

    try {
      // Authentification
      const res = await fetch(`${API}/api/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });
      const authData = await res.json();

      if (!res.ok) {
        setError(authData.error?.message || "Email ou mot de passe invalide.");
        setLoading(false);
        return;
      }

      // Stocker le token
      localStorage.setItem("token", authData.jwt);

      // Récupérer le rôle de l'utilisateur
      const userRes = await fetch(`${API}/api/users/me?populate=role`, {
        headers: { Authorization: `Bearer ${authData.jwt}` },
      });
      const userData = await userRes.json();

      if (!userRes.ok) {
        setError("'Impossible de récupérer les informations de l'utilisateur");
        setLoading(false);
        return;
      }

      const roleName = userData.role?.name;
      setTimeout(() => {
        if (roleName === "teacher") router.push("/teacher");
        else router.push("/admin");
      }, 800);
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
    }
  };

  return (
    <Root>
      <AuthCard>
        <CardContent sx={{ p: 5, position: "relative" }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <DotLottieReact
              src="https://lottie.host/b16ac9e9-c198-41ff-9592-03cd4fe72562/OiXbqMHDnc.lottie"
              autoplay
              loop
              style={{ height: 100 }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, mt: 1, color: theme.palette.primary.main }}
            >
              Bienvenue !
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connectez-vous pour continuer
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Votre identifiant"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockReset color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, py: 1.5, borderRadius: 2, fontSize: "1rem" }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Se connecter"
              )}
            </Button>

            <Box
              sx={{
                mt: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button
                size="small"
                onClick={() => setShowForgot(!showForgot)}
                sx={{ textTransform: "none" }}
              >
                Mot de passe oublié ?
              </Button>
              <Button
                size="small"
                variant="text"
                disabled
                sx={{ textTransform: "none", position: "relative" }}
              >
                Contacter l'administration
                <Box
                  component="span"
                  sx={{
                    position: "absolute",
                    top: -20,
                    typography: "caption",
                    bgcolor: "background.paper",
                    px: 0.5,
                    opacity: 0,
                    transition: "opacity 0.3s",
                    pointerEvents: "none",
                  }}
                  className="coming-soon"
                >
                  À venir
                </Box>
              </Button>
            </Box>

            {showForgot && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Veuillez contacter l'administration pour réinitialiser votre mot
                de passe.
              </Alert>
            )}
          </Box>
        </CardContent>
      </AuthCard>

      {loading && <LoadingIn />}

      <style jsx global>{`
        .MuiButton-root:hover .coming-soon {
          opacity: 1;
        }
      `}</style>
    </Root>
  );
}
