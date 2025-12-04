import { useState } from "react";
import {
  Box, Card, CardContent, Stack, Avatar, Typography, Divider,
} from "@mui/material";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PartesUpload from "@components/contextOrganization/PartsUpload";
import PartesTable from "@components/contextOrganization/PartsTable";

type Colors = {
  blue: string;
  green: string;
  subtle: string;
  border: string;
  bg: string;
  card: string;
};

type MatrizParte = {
  id: string;
  fecha: string;          
  descripcion: string;
  archivoNombre: string;
  file: File;
};

const COLORS: Colors = {
  blue: "#142334",
  green: "#279B48",
  subtle: "#667085",
  border: "#E5E7EB",
  bg: "#FFFFFF",
  card: "#FFFFFF",
};

const Header = ({
  icon,
  color,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle?: string;
}) => (
  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.25 }}>
    <Avatar
      variant="circular"
      sx={{
        width: 40,
        height: 40,
        bgcolor: color,
        color: "#FFFFFF",
      }}
    >
      {icon}
    </Avatar>
    <Stack>
      <Typography sx={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, color: COLORS.blue }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: 13, color: COLORS.subtle }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  </Stack>
);

export default function MatrixParts() {
  const [matrices, setMatrices] = useState<MatrizParte[]>([]);

  const handleUpload = ({ descripcion, file }: { descripcion: string; file: File }) => {
    const nueva: MatrizParte = {
      id: crypto.randomUUID(),
      fecha: new Date().toLocaleDateString(),
      descripcion,
      archivoNombre: file.name,
      file,
    };
    setMatrices((prev) => [nueva, ...prev]);
  };

  const handleDownload = (id: string) => {
    const item = matrices.find((m) => m.id === id);
    if (!item?.file) return;
    const url = URL.createObjectURL(item.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.archivoNombre || "matriz_partes_interesadas";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: COLORS.bg,
        pl: { xs: 2, md: 3 },
        pr: { xs: 2, md: 2 },
        pt: 2,
        pb: 4,
      }}
    >
      <Card
        sx={{
          mb: 2,
          maxWidth: 1240,
          borderRadius: 4,
          bgcolor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Header
            icon={<Groups2OutlinedIcon fontSize="small" />}
            color={COLORS.blue}
            title="Cargue la matriz de partes interesadas"
            subtitle="Escriba una breve descripción y suba el archivo correspondiente."
          />
          <PartesUpload onUpload={handleUpload} colors={COLORS} />
        </CardContent>
      </Card>

      <Card
        sx={{
          maxWidth: 1240,
          borderRadius: 4,
          bgcolor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Header
            icon={<InsertDriveFileOutlinedIcon fontSize="small" />}
            color={COLORS.green}
            title="Matrices cargadas"
          />
          <Divider sx={{ mb: 1.25, borderColor: COLORS.border }} />
          <PartesTable matrices={matrices} onDownload={handleDownload} colors={COLORS} />
        </CardContent>
      </Card>
    </Box>
  );
}
