import { useState } from "react";
import { Stack, TextField, Button, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

type Colors = {
  blue: string;
  green: string;
  subtle: string;
  border: string;
};

type Props = {
  onUpload: (payload: { descripcion: string; file: File }) => void;
  colors: Colors;
};

export default function PartesUpload({ onUpload, colors }: Props) {
  const [descripcion, setDescripcion] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!descripcion.trim() || !file) return;
    onUpload({ descripcion: descripcion.trim(), file });
    setDescripcion("");
    setFile(null);
  };

  return (
    <Stack spacing={1.5}>
      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Descripción *"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#FFFFFF",
            borderRadius: 2.5,
            "& fieldset": { borderColor: colors.border },
            "&:hover fieldset": { borderColor: colors.blue },
            "&.Mui-focused fieldset": { borderColor: colors.blue },
          },
        }}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
      >
        <Button
          variant="outlined"
          component="label"
          size="small"
          startIcon={<CloudUploadIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            borderColor: `${colors.blue}77`,
            color: colors.blue,
            bgcolor: "#FFFFFF",
            height: 36,
            minWidth: 210,
            borderRadius: 2.5,
            "&:hover": { borderColor: colors.blue, bgcolor: `${colors.blue}08` },
          }}
        >
          Seleccionar archivo
          <input
            type="file"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Button>

        <Typography variant="body2" sx={{ color: colors.subtle, flexGrow: 1, minHeight: 20 }}>
          {file ? file.name : "Aún no has seleccionado un archivo."}
        </Typography>

        <Button
          variant="contained"
          size="small"
          onClick={handleSubmit}
          disabled={!file || !descripcion.trim()}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            bgcolor: colors.blue,
            height: 36,
            minWidth: 160,
            borderRadius: 2.5,
            "&:hover": { bgcolor: "#0F1B29" },
            "&.Mui-disabled": { bgcolor: "#E3E8EF", color: "#9AA4B2" },
          }}
        >
          SUBIR MATRIZ
        </Button>
      </Stack>
    </Stack>
  );
}
