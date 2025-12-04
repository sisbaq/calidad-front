import React from "react";
import {
  Box,
  Stack,
  Typography,
  Card,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FlagIcon from "@mui/icons-material/Flag";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

const BLUE = "#142334";
const GREEN = "#279B48";

type AccentAccordionCardProps = {
  title: string;
  icon: React.ElementType;
  accentColor?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
};

function AccentAccordionCard({
  title,
  icon: Icon,
  accentColor = BLUE,
  defaultExpanded = false,
  children,
}: AccentAccordionCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        borderRadius: 3,
        boxShadow: "0 6px 20px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)",
        borderLeft: `8px solid ${accentColor}`,
      }}
    >
      <Accordion
        defaultExpanded={defaultExpanded}
        disableGutters
        elevation={0}
        sx={{ "&::before": { display: "none" }, boxShadow: "none" }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: BLUE }} />}
          sx={{
            px: { xs: 2, md: 3 },
            minHeight: 64,
            "& .MuiAccordionSummary-content": { my: 1, alignItems: "center" },
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={<Icon />}
              label=""
              sx={{
                bgcolor: "rgba(20,35,52,0.06)",
                color: accentColor,
                ".MuiChip-icon": { color: accentColor },
                borderRadius: "50%",
                height: 44,
                width: 44,
                "& .MuiChip-label": { display: "none" },
              }}
            />
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ color: BLUE, letterSpacing: 0.2 }}
            >
              {title}
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
          <Divider sx={{ mb: 2 }} />
          {children}
        </AccordionDetails>
      </Accordion>
    </Card>
  );
}

export default function MissionVisionObjectives() {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 6 },
        py: { xs: 3, md: 4 },
        maxWidth: 1100,
        mx: "auto",
        display: "grid",
        rowGap: 3,
      }}
    >
      <Box mb={1}>
        <Typography variant="h4" fontWeight={800} sx={{ color: BLUE }}>
          Nuestra Identidad
        </Typography>
        <Box
          sx={{
            width: 72,
            height: 4,
            bgcolor: GREEN,
            borderRadius: 2,
            mt: 1,
          }}
        />
      </Box>

      <AccentAccordionCard title="Misión" icon={FlagIcon} accentColor={BLUE} defaultExpanded>
        <Typography variant="body1" sx={{ color: "rgba(20,35,52,0.9)", lineHeight: 1.75 }}>
          Promovemos el desarrollo sostenible del Distrito Especial, Industrial y Portuario de
          Barranquilla, sobre las bases de la equidad social, conectividad y biodiversidad, a través
          de la planificación del desarrollo económico, social, ambiental y del territorio, la
          administración efectiva de los recursos, el fortalecimiento de la participación ciudadana
          en la gestión pública, el ejercicio de los derechos y deberes constitucionales y la
          convivencia pacífica de sus habitantes, apoyados en un Modelo Integrado de Planeación y
          Gestión que resuelve sus necesidades y expectativas de los ciudadanos, con integridad y
          calidad en el servicio.
        </Typography>
      </AccentAccordionCard>

      <AccentAccordionCard title="Visión" icon={VisibilityIcon} accentColor={GREEN} defaultExpanded>
        <Typography variant="body1" sx={{ color: "rgba(20,35,52,0.9)", lineHeight: 1.75 }}>
          Barranquilla será ejemplo nacional de una ciudad con mayor oferta de servicios públicos de
          calidad y especialmente condiciones favorables de progreso para sus ciudadanos más
          vulnerables. Garantizaremos la seguridad, la sana convivencia y el progreso para todos.
          Barranquilla tendrá una calidad de vida soportada en la planificación integral del
          territorio mediante una política pública orientada al cierre de brechas sociales, donde la
          igualdad de oportunidades permita liberar el potencial del desarrollo social, económico,
          cultural, político y ambiental de nuestra ciudad y todos sus habitantes; seremos una
          Barranquilla a otro nivel.
        </Typography>
      </AccentAccordionCard>

      <AccentAccordionCard
        title="Objetivos Estratégicos"
        icon={TrackChangesIcon}
        accentColor={GREEN}
        defaultExpanded={false}
      >
        <Box display="grid" rowGap={2}>
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
            <b>Objetivo 1:</b> Garantizar la seguridad y la convivencia ciudadana, promoviendo un
            entorno donde todos se sientan protegidos; garantizando la inclusión social y el acceso
            equitativo a servicios de salud, educación y vivienda.
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
            <b>Objetivo 2:</b> Construir un distrito que fortalezca su capacidad de adaptarse,
            innovar y ofrecer un entorno en constante evolución que inspire a sus habitantes y
            atraiga oportunidades empresariales.
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
            <b>Objetivo 3:</b> Visionar una ciudad sostenible y amigable con el medio ambiente,
            garantizando el equilibrio entre crecimiento económico, cuidado del medio ambiente y
            bienestar social.
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
            <b>Objetivo 4:</b> Asegurar que la gestión pública se realice de manera transparente,
            ética y participativa, optimizando procesos y fortaleciendo la participación ciudadana en
            la toma de decisiones.
          </Typography>
        </Box>
      </AccentAccordionCard>
    </Box>
  );
}
