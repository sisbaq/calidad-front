// LeadershipCommitment.tsx
import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider,
} from "@mui/material";
import HandshakeIcon from "@mui/icons-material/Handshake";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const COLORS = {
  blue: "#142334",
  green: "#279B48",
} as const;

type SectionHeaderProps = {
  title: string;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 6,
          height: 28,
          bgcolor: COLORS.green,
          borderRadius: 3,
        }}
      />
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: COLORS.blue,
          letterSpacing: 0.3,
        }}
      >
        {title}
      </Typography>
    </Box>
    <Box
      sx={{
        mt: 1.5,
        width: 90,
        height: 4,
        bgcolor: COLORS.blue,
        borderRadius: 4,
        opacity: 0.85,
      }}
    />
  </Box>
);

type CardHeaderProps = {
  icon: React.ReactNode;
  title: string;
  iconBg?: string;
};

const CardHeader: React.FC<CardHeaderProps> = ({
  icon,
  title,
  iconBg = COLORS.green,
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: 2,
        bgcolor: iconBg,
        color: "white",
        display: "grid",
        placeItems: "center",
        boxShadow: "0 6px 16px rgba(39,155,72,0.24)",
      }}
    >
      {icon}
    </Box>
    <Typography
      variant="h6"
      sx={{ fontWeight: 800, color: COLORS.blue, letterSpacing: 0.2 }}
    >
      {title}
    </Typography>
  </Box>
);

type Estrategia = {
  titulo: string;
  descripcion: string;
};

const LeadershipCommitment: React.FC = () => {
  const estrategias: ReadonlyArray<Estrategia> = [
    {
      titulo: "Estrategia 1",
      descripcion:
        "a) Estableciendo la unidad de propósito en el sector central y descentralizado del gobierno distrital hacia el logro de la calidad en sus servicios, incluyendo la importancia de satisfacer los requisitos del cliente, así como las normas y el marco legal aplicable al servicio prestado.",
    },
    {
      titulo: "Estrategia 2",
      descripcion:
        "b) Estableciendo, comunicando y explicando la política de la calidad a todos los niveles del gobierno distrital, para que todos los miembros la conozcan y la comprendan.",
    },
    {
      titulo: "Estrategia 3",
      descripcion:
        "c) Asegurando que se establezcan los objetivos de la calidad, que se encuentran en el numeral 6.2 de este manual y que sean coherentes con la política de la calidad y los requisitos del cliente ciudadano.",
    },
    {
      titulo: "Estrategia 4",
      descripcion:
        "d) Realizando revisiones periódicas del sistema de gestión de la calidad mediante la evaluación del desempeño institucional, para hacer seguimiento al cumplimiento de políticas y objetivos como parte de la mejora continua.",
    },
    {
      titulo: "Estrategia 5",
      descripcion:
        "e) Suministrando y asegurando la disponibilidad de los recursos necesarios para cumplir los objetivos.",
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: "#F7FAF9",
        minHeight: "100%",
      }}
    >
      <SectionHeader title="Liderazgo y compromiso" />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3.5,
          borderRadius: 3,
          bgcolor: "white",
          border: "1px solid",
          borderColor: "rgba(20,35,52,0.08)",
        }}
      >
        <CardHeader
          title="Compromiso"
          icon={<HandshakeIcon sx={{ fontSize: 26 }} />}
        />
        <Typography
          variant="body1"
          sx={{ color: "rgba(20,35,52,0.8)", lineHeight: 1.75 }}
        >
          La alta dirección de la Alcaldía Distrital de Barranquilla proporciona
          evidencia de su liderazgo y compromiso con la mejora continua de la
          eficacia, eficiencia y efectividad del sistema integral de gestión,
          identificando continuamente las necesidades y expectativas de sus
          clientes, y asegurando que los procesos y programas del gobierno
          distrital cumplan los requisitos legales y reglamentarios. Las
          estrategias y acciones para demostrar lo anterior se describen a
          continuación.
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          bgcolor: "white",
          border: "1px solid",
          borderColor: "rgba(20,35,52,0.08)",
        }}
      >
        <CardHeader
          title="Estrategias y acciones"
          icon={<TrackChangesIcon sx={{ fontSize: 26 }} />}
        />
        <Divider sx={{ my: 1.5, borderColor: "rgba(20,35,52,0.08)" }} />

        {estrategias.map(({ titulo, descripcion }, idx) => (
          <Accordion
            key={idx}
            disableGutters
            elevation={0}
            sx={{
              mb: 1.25,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "rgba(20,35,52,0.08)",
              "&:before": { display: "none" },
              transition: "all .2s ease",
              "&:hover": {
                borderColor: "rgba(39,155,72,0.5)",
                boxShadow: "0 6px 20px rgba(20,35,52,0.06)",
              },
              "&.Mui-expanded": {
                borderColor: COLORS.green,
                boxShadow: "0 10px 24px rgba(39,155,72,0.18)",
              },
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    color: COLORS.blue,
                    ".Mui-expanded &": { color: COLORS.green },
                  }}
                />
              }
              sx={{
                minHeight: 56,
                px: 2,
                "& .MuiAccordionSummary-content": {
                  my: 1,
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  color: COLORS.blue,
                  ".MuiAccordion-root.Mui-expanded &": { color: COLORS.green },
                }}
              >
                {titulo}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
              <Typography
                variant="body2"
                sx={{ color: "rgba(20,35,52,0.8)", lineHeight: 1.7 }}
              >
                {descripcion}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
          mt: 3,
        }}
      >
        {["#D5E7DB", COLORS.green, "#D5E7DB"].map((c, i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: c,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default LeadershipCommitment;
