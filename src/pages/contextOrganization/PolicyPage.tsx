import React from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Avatar,
  IconButton,
  Collapse,
  Tooltip,
} from "@mui/material";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import ChecklistRtlRoundedIcon from "@mui/icons-material/ChecklistRtlRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const AZUL = "#142334";
const VERDE = "#279B48";

const politicaText =
  "La Alcaldía Distrital de Barranquilla incrementa la satisfacción de sus ciudadanos y demás partes interesadas con la entrega de productos y servicios confiables y de calidad, implementando medidas de intervención que contribuyan a la protección del medio ambiente, la prevención de la contaminación, el buen uso de los recursos naturales y la promoción de la seguridad de los funcionarios y contratistas; asegura el cumplimiento de los requisitos legales y reglamentarios, optimiza sus procesos y garantiza el uso eficiente de sus recursos en la inversión pública, para la mejora continua del desempeño de su sistema Integrado de Gestión.";

const objetivosSIG: string[] = [
  " Incrementar la satisfacción de la ciudadanía en la entrega de productos (bienes y servicios) confiables y con la calidad requerida por los clientes y partes interesadas con una adecuada gestión de los riesgos identificados para alcanzar las metas y objetivos de la entidad.",
  "Prevenir y controlar los impactos y aspectos ambientales generados por la operación en el sede principal de la entidad mediante el seguimiento y control del consumo de combustible, agua, energía, papel y generación de residuos sólidos al igual que la adecuada gestión de los mismos.",
  "Adelantar toda la gestión del Distrito en condiciones y ambientes de trabajo seguros y saludables con el menor grado de riesgo para sus servidores mediante la identificación y reducción de los riesgos y peligros que puedan afectar la seguridad y salud de los funcionarios y contratistas.",
  "Adelantar toda la gestión del Distrito con estricta observancia de los requisitos legales y reglamentarios aplicables para prevenir la afectación reputacional y económica que puedan derivar de su incumpliento.",
  "Evaluar continuamente la conveniencia, adecuación y eficacia del SIG para mejorar su desempeño y mantener el estandar administrativo y de gestión de la calidad establecido por los lineamientos nacionales e internacionales.",
];

type BorderedCardProps = {
  color: string;
  icon: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

function BorderedCard({ color, icon, title, actions, children }: BorderedCardProps) {
  return (
    <Card
      elevation={1}
      sx={{
        overflow: "hidden",
        borderRadius: 3,
        borderLeft: `6px solid ${color}`,
        boxShadow: "0 8px 20px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.05)"
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack direction="row" spacing={2.5} alignItems="flex-start">
          <Avatar
            variant="circular"
            sx={{
              bgcolor: `${color}15`,
              color,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1b2533" }}>
                {title}
              </Typography>
              {actions}
            </Stack>

            <Box sx={{ color: "text.secondary", lineHeight: 1.9 }}>{children}</Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function PoliticaObjetivos() {
  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <Box sx={{ maxWidth: 1060, mx: "auto", px: { xs: 2, md: 0 }, py: 2 }}>
      <Stack spacing={3.5}>
        <BorderedCard
          color={AZUL}
          title="Nuestra Política"
          icon={<PolicyRoundedIcon sx={{ fontSize: 28 }} />}
        >
          <Typography component="p">{politicaText}</Typography>
        </BorderedCard>

        <BorderedCard
          color={VERDE}
          title="Objetivos del SIG"
          icon={<ChecklistRtlRoundedIcon sx={{ fontSize: 28 }} />}
          actions={
            <Tooltip title={open ? "Ocultar" : "Mostrar"}>
              <IconButton
                aria-label="Alternar objetivos"
                onClick={() => setOpen((v) => !v)}
                sx={{
                  transform: `rotate(${open ? 180 : 0}deg)`,
                  transition: "transform .2s ease",
                  color: VERDE,
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Tooltip>
          }
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              component="ol"
              sx={{
                m: 0,
                pl: 3.5,
                listStylePosition: "outside",
                "& > li": { mb: 1 },
              }}
            >
              {objetivosSIG.map((item, idx) => (
                <Box component="li" key={idx}>
                  {item}
                </Box>
              ))}
            </Box>
          </Collapse>
        </BorderedCard>
      </Stack>
    </Box>
  );
}
