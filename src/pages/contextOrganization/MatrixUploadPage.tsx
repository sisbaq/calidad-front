/*
 This is the Context Matrix Upload Component for Administrators
*/
import { useState, useEffect } from "react";
import {
  Box,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme,
  CircularProgress,
} from "@mui/material";
import type { AlertColor } from "@mui/material";
import StakeholderMatrixUploadForm from "@components/contextOrganization/MatrixUploadForm";
import StakeholderMatrixTable from "@components/contextOrganization/MatrixTable";
import EditMatrixDialog from "@components/contextOrganization/EditMatrixDialog";
import {
  createContextMatrix,
  getContextMatrixes,
  getContextTypes,
  deleteContextMatrix,
  updateContextMatrix,
} from "@services/organization-context.service";
import type { ContextType, ContextMatrix } from "@/types/organization-context";
import CenteredSpinner from "@components/common/CenteredSpinner";

const theme = createTheme({
  palette: {
    primary: { main: "#142334" },
    success: { main: "#279B48" },
  },
  shape: { borderRadius: 12 },
});

export default function StakeholderMatrixUploadPage() {
  const [items, setItems] = useState<ContextMatrix[]>([]);
  const [contextTypes, setContextTypes] = useState<ContextType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loadingTypes, setLoadingTypes] = useState<boolean>(true);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    matrix: ContextMatrix | null;
  }>({ open: false, matrix: null });
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: AlertColor;
  }>({
    open: false,
    msg: "",
    severity: "info",
  });

  useEffect(() => {
    const fetchContextTypes = async () => {
      try {
        setLoadingTypes(true);
        const types = await getContextTypes();
        setContextTypes(types);
      } catch (error) {
        setSnack({
          open: true,
          msg: error instanceof Error ? error.message : "Error al cargar los tipos de contexto.",
          severity: "error",
        });
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchContextTypes();
  }, []);

  useEffect(() => {
    const fetchMatrixes = async () => {
      try {
        setInitialLoading(true);
        const matrices = await getContextMatrixes();
        setItems(matrices);
      } catch (error) {
        setSnack({
          open: true,
          msg: error instanceof Error ? error.message : "Error al cargar las matrices.",
          severity: "error",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchMatrixes();
  }, []);

  const handleUpload = async ({
    descripcion,
    tipo,
    file,
    resetForm,
  }: {
    descripcion: string;
    tipo: number;
    file: File | null;
    resetForm: () => void;
  }) => {
    if (!descripcion?.trim()) {
      setSnack({
        open: true,
        msg: "La descripción es obligatoria.",
        severity: "warning",
      });
      return;
    }
    if (!tipo) {
      setSnack({
        open: true,
        msg: "Debes seleccionar un tipo de matriz.",
        severity: "warning",
      });
      return;
    }
    if (!file) {
      setSnack({
        open: true,
        msg: "Debes seleccionar un archivo.",
        severity: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await createContextMatrix({
        description: descripcion.trim(),
        type: tipo,
        document: file,
      });

      if (result) {
        const matrices = await getContextMatrixes();
        setItems(matrices);
        resetForm?.();
        setSnack({
          open: true,
          msg: "Matriz cargada correctamente.",
          severity: "success",
        });
      }
    } catch (error) {
      setSnack({
        open: true,
        msg: error instanceof Error ? error.message : "Error al cargar la matriz.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (matrix: ContextMatrix) => {
    setEditDialog({ open: true, matrix });
  };

  const handleEditSave = async (
    id: number,
    description: string,
    file: File | null,
  ) => {
    try {
      const updated = await updateContextMatrix(id, description, file);

      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));

      setEditDialog({ open: false, matrix: null });

      setSnack({
        open: true,
        msg: "Matriz actualizada correctamente.",
        severity: "success",
      });
    } catch (error) {
      setSnack({
        open: true,
        msg: error instanceof Error ? error.message : "Error al actualizar la matriz.",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteContextMatrix(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setSnack({
        open: true,
        msg: "Matriz eliminada correctamente.",
        severity: "success",
      });
    } catch (error) {
      setSnack({
        open: true,
        msg: error instanceof Error ? error.message : "Error al eliminar la matriz.",
        severity: "error",
      });
    }
  };

  if (loadingTypes || initialLoading) {
    return <CenteredSpinner />;
  }

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
        <StakeholderMatrixUploadForm
          onUpload={handleUpload}
          disabled={loading}
          contextTypes={contextTypes}
        />

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        <StakeholderMatrixTable rows={items} onDelete={handleDelete} onEdit={handleEdit} showActions={true} />

        <EditMatrixDialog
          open={editDialog.open}
          matrix={editDialog.matrix}
          onClose={() => setEditDialog({ open: false, matrix: null })}
          onSave={handleEditSave}
        />

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
