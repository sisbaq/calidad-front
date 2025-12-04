import * as React from "react";
import { Box, Container, Divider, Stack, Typography, CircularProgress, Alert, Snackbar } from "@mui/material";
import { appColors } from "@/theme/colors";
import DocumentForm from "@/components/create_documents/DocumentAdminForm";
import DocumentsFilters from "@/components/create_documents/DocumentsFilters";
import DocumentsTable from "@/components/create_documents/DocumentsTable";
import { useDocuments } from "@/hooks/useDocument";
import { getDocumentTypes } from "@/services/document.service";
import { getProcesses } from "@/services/findings.service";
import type { DocumentType } from "@/types/document";
import type { ProcessOption } from "@/types/audit";

type Severity = "success" | "error" | "info" | "warning";

interface ToastState {
  open: boolean;
  message: string;
  severity: Severity;
}

export default function DocumentsAdminPage(): React.ReactElement {
  const h = React.createElement;

  const { addDocument, filteredDocuments, filters, setFilters, loading, error, refetch } = useDocuments();

  const [documentTypes, setDocumentTypes] = React.useState<DocumentType[]>([]);
  const [processes, setProcesses] = React.useState<ProcessOption[]>([]);
  const [loadingMetadata, setLoadingMetadata] = React.useState(true);
  const [metadataError, setMetadataError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

  React.useEffect(() => {
    const fetchMetadata = async () => {
      setLoadingMetadata(true);
      setMetadataError(null);
      try {
        const [typesData, processesData] = await Promise.all([
          getDocumentTypes(),
          getProcesses()
        ]);
        setDocumentTypes(typesData);
        setProcesses(processesData);
      } catch (err) {
        setMetadataError(err instanceof Error ? err.message : 'Error al cargar los datos');
        console.error('Error fetching metadata:', err);
      } finally {
        setLoadingMetadata(false);
      }
    };

    fetchMetadata();
  }, []);

  const handleCreate = (doc: any) => {
    addDocument(doc);
    refetch();
    setToast({
      open: true,
      message: "Documento transversal creado exitosamente",
      severity: "success",
    });
  };

  const handleCloseToast = () => {
    setToast((t) => ({ ...t, open: false }));
  };

  if (loadingMetadata) {
    return h(
      Box,
      { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' } },
      h(CircularProgress)
    );
  }

  if (metadataError) {
    return h(
      Box,
      { sx: { p: 3 } },
      h(Alert, { severity: 'error' }, metadataError)
    );
  }

  return h(
    Box,
    { sx: { minHeight: "100vh", bgcolor: "background.default" } },
    h(
      Container,
      { maxWidth: "xl", sx: { py: 3 } },
      h(
        Stack,
        { spacing: 1.5, sx: { mb: 1 } },
        h(
          Typography,
          { variant: "h4", sx: { fontWeight: 800, color: appColors.blue } },
          "Panel de Administración"
        ),
        h(
          Typography,
          { variant: "body1", sx: { color: "text.secondary" } },
          "Crea documentos transversales para que los usuarios puedan consultarlos más tarde."
        )
      ),
      h(DocumentForm, { 
        onCreate: handleCreate, 
        documentTypes: documentTypes,
        processes: processes
      }),
      h(DocumentsFilters, {
        type: filters.type,
        year: filters.year,
        process: filters.process,
        onChange: setFilters,
        documentTypes: documentTypes,
        processes: processes
      }),
      h(Divider, { sx: { my: 2 } }),
      h(
        Stack,
        { spacing: 1.5 },
        h(
          Typography,
          { variant: "h6", sx: { color: appColors.green, fontWeight: 700 } },
          "Documentos creados"
        ),
        loading && h(Box, { sx: { display: 'flex', justifyContent: 'center', p: 3 } }, h(CircularProgress)),
        error && h(Alert, { severity: 'error', sx: { mb: 2 } }, error),
        !loading && !error && h(Box, { sx: { width: "100%" } }, h(DocumentsTable, { rows: filteredDocuments }))
      ),
      h(
        Snackbar,
        {
          open: toast.open,
          autoHideDuration: 4000,
          onClose: handleCloseToast,
          anchorOrigin: { vertical: "bottom", horizontal: "center" },
        },
        h(Alert, { severity: toast.severity, variant: "filled", sx: { width: "100%" } }, toast.message)
      )
    )
  );
}
