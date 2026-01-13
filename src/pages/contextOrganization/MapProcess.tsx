import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TabsProcess from "../../components/common/TabsProcess";
import mapaProcesos from "../../assets/images/MAPA_PROCESOS.png";

const PALETTE = { blue: "#142334", green: "#279B48" };

export default function MapProcess() {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <Box sx={{ width: "100%", px: { xs: 1, sm: 2, md: 4 }, py: 4 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          color: PALETTE.blue,
          letterSpacing: 0.3,
          textAlign: "center",
          mb: 1,
        }}
      >
        Mapa de Procesos
      </Typography>

      <Card
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          mb: 2,
          border: `1px solid ${PALETTE.blue}14`,
          background:
            "linear-gradient(90deg, rgba(20,35,52,0.04) 0%, rgba(39,155,72,0.06) 100%)",
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
          <Box
            component="img"
            src={mapaProcesos as unknown as string}
            alt="mapa procesos alcaldía"
            sx={{
              width: "100%",
              display: "block",
              objectFit: "contain",
              borderRadius: 2,
              border: `1px solid ${PALETTE.blue}1A`,
              boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
              backgroundColor: "#fff",
            }}
          />
        </CardContent>
      </Card>

      <Card elevation={2} sx={{ borderRadius: 3, border: `1px solid ${PALETTE.blue}14`, overflow: "hidden" }}>
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            pt: { xs: 1.5, md: 2 },
            pb: 1,
            bgcolor: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PALETTE.blue }}>
              Procesos
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Consulta los procesos estratégicos, misionales, de apoyo y evaluación.
            </Typography>
          </Box>

          <Tooltip title={expanded ? "Ocultar" : "Mostrar"}>
            <IconButton
              aria-label="mostrar/ocultar tabla"
              onClick={() => setExpanded((v) => !v)}
              sx={{ ml: 1, border: `1px solid ${PALETTE.blue}33`, bgcolor: "#fff" }}
            >
              {expanded ? (
                <KeyboardArrowUpIcon htmlColor={PALETTE.green} />
              ) : (
                <KeyboardArrowDownIcon htmlColor={PALETTE.blue} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ borderColor: `${PALETTE.blue}1A` }} />

        <Box sx={{ p: { xs: 1, md: 2 }, bgcolor: "#fff" }}>
          <TabsProcess collapsed={!expanded} />
        </Box>
      </Card>
    </Box>
  );
}
