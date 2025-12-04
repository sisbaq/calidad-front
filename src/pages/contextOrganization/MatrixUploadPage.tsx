import { useState } from "react";
import { Box, Snackbar, Alert, ThemeProvider, createTheme } from "@mui/material";
import type { AlertColor } from "@mui/material";
import StakeholderMatrixUploadForm from "@components/contextOrganization/MatrixUploadForm";
import StakeholderMatrixTable from "@components/contextOrganization/MatrixTable";

type MatrixRow = {
  id: string;
  fecha: string; 
  descripcion: string;
  nombre: string;
  size: number;
  type?: string | null;
  url: string;
};

const theme = createTheme({
  palette: {
    primary: { main: "#142334" },
    success: { main: "#279B48" },
  },
  shape: { borderRadius: 12 },
});

export default function StakeholderMatrixUploadPage() {
  const [items, setItems] = useState<MatrixRow[]>([]);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: AlertColor }>({
    open: false,
    msg: "",
    severity: "info",
  });

  const handleUpload = ({ descripcion, file, resetForm }: { descripcion: string; file: File | null; resetForm: () => void; }) => {
    if (!descripcion?.trim()) {
      setSnack({ open: true, msg: "La descripción es obligatoria.", severity: "warning" });
      return;
    }
    if (!file) {
      setSnack({ open: true, msg: "Debes seleccionar un archivo.", severity: "warning" });
      return;
    }

    const id = crypto.randomUUID();
    const url = URL.createObjectURL(file);

    const nuevo: MatrixRow = {
      id,
      fecha: new Date().toISOString(),
      descripcion: descripcion.trim(),
      nombre: file.name,
      size: file.size,
      type: file.type,
      url,
    };

    setItems((prev) => [nuevo, ...prev]);
    resetForm?.();
    setSnack({ open: true, msg: "Matriz cargada correctamente.", severity: "success" });
  };

  const handleDelete = (id: string) => {
    setItems((prev) => {
      const victim = prev.find((x) => x.id === id);
      if (victim?.url) URL.revokeObjectURL(victim.url);
      return prev.filter((x) => x.id !== id);
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          mx: 0,
          px: { xs: 1, md: 2 },
          py: { xs: 1.5, md: 2 },
          display: "grid",
          gap: 2,
        }}
      >
        <StakeholderMatrixUploadForm onUpload={handleUpload} />
        <StakeholderMatrixTable rows={items} onDelete={handleDelete} />

        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            severity={snack.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
