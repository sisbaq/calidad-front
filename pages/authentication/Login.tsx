import {
  Box, Button, IconButton, TextField, Paper,
  Stack, FormControl, OutlinedInput, InputAdornment, InputLabel, Alert
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

import logo from "@assets/images/alcaldiavert-Azul.png";
import logoSigbaq from "@assets/images/sigbaq.jpg";
import ISO9001 from "@assets/images/ISO9001.jpg";
import ISO14001 from "@assets/images/ISO14001.jpg";
import IQNET from "@assets/images/IQNET.jpg";
import { InvalidCredentialsError } from "@errors/auth.errors";

const qualityLogos = [
  { src: ISO14001 },
  { src: ISO9001 },
  { src: IQNET },
];

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { session, login, loading } = useAuth();

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (session) {
      navigate(from, { replace: true });
    }
  }, [session, navigate, from]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ usuario, password });
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      if (err instanceof InvalidCredentialsError) {
        setError("Usuario o contraseña incorrectos.");
      } else {
        setError("Ocurrió un error al iniciar sesión. Intente más tarde.");
      }
    }
  };

  if (loading || session) {
    return null; 
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: "100vh" }}>
      <Stack spacing={3} alignItems="center">

        <Box>
          <img
            src={logoSigbaq}
            alt="logo sigbaq"
            style={{ width: "100%", maxWidth: "340px", height: "auto" }}
          />
        </Box>

        <Paper elevation={3} sx={{ p: 4, width: 400, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                fullWidth
                label="Usuario"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
              <FormControl variant="outlined" fullWidth required>
                <InputLabel htmlFor="password">Contraseña</InputLabel>
                <OutlinedInput
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  label="Contraseña"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPwd((p) => !p)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPwd ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
              >
                Iniciar Sesión
              </Button>
            </Stack>
          </form>
        </Paper>

        <Box>
          <img
            src={logo}
            alt="logo alcaldía"
            style={{ width: "100%", maxWidth: "280px", height: "auto" }}
          />
        </Box>

        <Box>
          <Stack direction="row" spacing={4}>
            {qualityLogos.map(({ src }, index) => (
              <img
                key={index}
                src={src}
                alt={`quality-logo-${index}`}
                style={{
                  maxWidth: 50,
                  height: "auto",
                  objectFit: "contain"
                }}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};
