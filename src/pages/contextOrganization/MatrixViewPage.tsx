/*
 This is the Context Matrix View Component for Gestor (Read-only)
*/
import { useState, useEffect } from "react";
import {
  Box,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import type { ContextMatrix } from "@/types/organization-context";
import type { AlertColor } from "@mui/material";
import StakeholderMatrixTable from "@components/contextOrganization/MatrixTable";
import { getContextMatrixes } from "@services/organization-context.service";
import CenteredSpinner from "@components/common/CenteredSpinner";

const theme = createTheme({
  palette: {
    primary: { main: "#142334" },
    success: { main: "#279B48" },
  },
  shape: { borderRadius: 12 },
});

export default function MatrixViewPage() {
  const [items, setItems] = useState<ContextMatrix[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
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

  if (initialLoading) {
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
        <StakeholderMatrixTable rows={items} showDownloadOnly={true} title="Matrices vigentes" />

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
