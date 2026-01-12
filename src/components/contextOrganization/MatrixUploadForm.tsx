import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Diversity3RoundedIcon from "@mui/icons-material/Diversity3Rounded";
import type { ContextType } from "@/types/organization-context";

type UploadPayload = {
  descripcion: string;
  tipo: number;
  file: File | null;
  resetForm: () => void;
};

type Props = {
  onUpload?: (payload: UploadPayload) => void;
  disabled?: boolean;
  contextTypes: ContextType[];
};

export default function StakeholderMatrixUploadForm({
  onUpload,
  disabled = false,
  contextTypes = [],
}: Props) {
  const [descripcion, setDescripcion] = useState<string>("");
  const [tipo, setTipo] = useState<number>(contextTypes[0]?.id || 0);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (contextTypes.length > 0 && tipo === 0) {
      setTipo(contextTypes[0].id);
    }
  }, [contextTypes, tipo]);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleTipoChange = (e: SelectChangeEvent<number>) => {
    setTipo(Number(e.target.value));
  };

  const resetForm = () => {
    setDescripcion("");
    setFile(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onUpload?.({ descripcion, tipo, file, resetForm });
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
        title='Formulario para subir matrices'
        subheader="Escribe una breve descripción y sube el archivo correspondiente."
      />

      <CardContent sx={{ pt: 2 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "grid", gap: 2 }}>
          <FormControl fullWidth disabled={disabled}>
            <InputLabel id="tipo-matriz-form-label">Tipo de matriz *</InputLabel>
            <Select
              labelId="tipo-matriz-form-label"
              value={tipo}
              label="Tipo de matriz *"
              onChange={handleTipoChange}
            >
              {contextTypes.map((ct) => (
                <MenuItem key={ct.id} value={ct.id}>
                  {ct.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Descripción *"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej. Matriz de partes interesadas – Secretaría de Planeación"
            fullWidth
            multiline
            minRows={2}
            disabled={disabled}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Button
              component="label"
              variant="outlined"
              color="primary"
              startIcon={<UploadFileIcon />}
              sx={{ borderColor: "primary.main", "&:hover": { borderColor: "primary.main" } }}
              disabled={disabled}
            >
              Seleccionar archivo
              <input
                type="file"
                hidden
                accept=".pdf,.xlsx,.xls,.csv,.ods,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleSelectFile}
                disabled={disabled}
              />
            </Button>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {file ? `Archivo seleccionado: ${file.name}` : "Aún no has seleccionado un archivo."}
            </Typography>

            <Box flex={1} />

            <Button type="submit" variant="contained" color="primary" disabled={disabled || !tipo}>
              Subir matriz
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
