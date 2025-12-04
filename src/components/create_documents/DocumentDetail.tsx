import { useState, useMemo } from "react";
import { Box, Typography, Snackbar, Alert, Container } from "@mui/material";
import DocumentForm from "@components/create_documents/DocumentForm";
import DocumentTable from "@/components/create_documents/DocumentAdminTable";
import type { SigDocument, DocumentType, RevisionStatus } from "@/types/document";

const BLUE = "#142334";

type Severity = "success" | "error" | "info" | "warning";

interface ToastState {
  open: boolean;
  message: string;
  severity: Severity;
}

export default function DocumentPage(): React.ReactElement {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

   const [documents, setDocuments] = useState<SigDocument[]>([]);

  // ⬇️ Catálogos locales (si luego los traigo del backend, reemplazo el contenido;
  // la forma (tipos) queda lista para conectarse sin cambios de lógica)
  const DOCUMENT_TYPES: DocumentType[] = useMemo(
    () =>
      [
        { tipId: 1, tipNombre: "Manual" },
        { tipId: 2, tipNombre: "Procedimiento" },
        { tipId: 3, tipNombre: "Formato" },
        { tipId: 4, tipNombre: "Instructivo" },
        { tipId: 5, tipNombre: "Documento Libre" },
        { tipId: 6, tipNombre: "Guía" },
        { tipId: 7, tipNombre: "Otros" },
      ] as DocumentType[],
    []
  );

  const REVISION_STATUSES: RevisionStatus[] = useMemo(
    () =>
      [
        { edrId: 1, edrNomEstado: "Pendiente" },
        { edrId: 2, edrNomEstado: "En revisión" },
        { edrId: 3, edrNomEstado: "Aprobado" },
        { edrId: 4, edrNomEstado: "Rechazado" },
        { edrId: 5, edrNomEstado: "Devuelto" },
      ] as RevisionStatus[],
    []
  );

 
  const addDocument = (doc: SigDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleSuccess = (msg = "Documento creado") =>
    setToast({ open: true, message: msg, severity: "success" });

  const handleError = (msg: string) =>
    setToast({ open: true, message: msg, severity: "error" });

  return (
    <Container maxWidth={false} sx={{ py: 6, px: { xs: 2, sm: 3, md: 6 } }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: BLUE }}>
          Gestión de Documentos TES
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Crear y listar documentos del SIG
        </Typography>
      </Box>

           <DocumentForm
        documentTypes={DOCUMENT_TYPES}
        onAdd={addDocument}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <DocumentTable
        rows={documents}
        documentTypes={DOCUMENT_TYPES}
        revisionStatuses={REVISION_STATUSES}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
