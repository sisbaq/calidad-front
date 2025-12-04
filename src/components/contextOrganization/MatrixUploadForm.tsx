import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Diversity3RoundedIcon from "@mui/icons-material/Diversity3Rounded";

type UploadPayload = {
  descripcion: string;
  file: File | null;
  resetForm: () => void;
};

type Props = {
  onUpload?: (payload: UploadPayload) => void;
};

export default function StakeholderMatrixUploadForm({ onUpload }: Props) {
  const [descripcion, setDescripcion] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const resetForm = () => {
    setDescripcion("");
    setFile(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onUpload?.({ descripcion, file, resetForm });
  };

  return (
    <Card elevation={0} sx={{ border: "1px solid #EAEAEA", borderRadius: 3, width: "100%" }}>
      <CardHeader
        sx={{ pb: 0, alignItems: "center" }}
        avatar={
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "999px",
              bgcolor: "#142334",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Diversity3RoundedIcon sx={{ color: "#fff" }} />
          </Box>
        }
        titleTypographyProps={{ variant: "h6", sx: { color: "primary.main", fontWeight: 700 } }}
        title="Cargue la matriz de contexto"
        subheader="Escribe una breve descripción y sube el archivo correspondiente."
      />

      <CardContent sx={{ pt: 2 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Descripción *"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej. Matriz de partes interesadas – Secretaría de Planeación"
            fullWidth
            multiline
            minRows={2}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Button
              component="label"
              variant="outlined"
              color="primary"
              startIcon={<UploadFileIcon />}
              sx={{ borderColor: "primary.main", "&:hover": { borderColor: "primary.main" } }}
            >
              Seleccionar archivo
              <input
                type="file"
                hidden
                accept=".pdf,.xlsx,.xls,.csv,.ods,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleSelectFile}
              />
            </Button>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {file ? `Archivo seleccionado: ${file.name}` : "Aún no has seleccionado un archivo."}
            </Typography>

            <Box flex={1} />

            <Button type="submit" variant="contained" color="primary">
              Subir matriz
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
