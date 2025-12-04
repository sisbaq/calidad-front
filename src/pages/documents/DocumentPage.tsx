import { useState, useEffect } from "react";
import { Box, Typography, Snackbar, Alert, CircularProgress } from "@mui/material";
import DocumentForm from "@components/create_documents/DocumentForm";
import DocumentTable from "@/components/create_documents/DocumentAdminTable";
import { getDocuments, updateDocument, getDocumentTypes, getRevisionStatuses } from "@/services/document.service";
import type { SigDocument, DocumentType, RevisionStatus } from "@/types/document";

const BLUE = "#142334";

type Severity = "success" | "error" | "info" | "warning";

interface ToastState {
  open: boolean;
  message: string;
  severity: Severity;
}

export default function DocumentPage() {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });
  const [documents, setDocuments] = useState<SigDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [revisionStatuses, setRevisionStatuses] = useState<RevisionStatus[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [docs, types, statuses] = await Promise.all([
          getDocuments(),
          getDocumentTypes(),
          getRevisionStatuses()
        ]);

        setDocuments(docs);
        setDocumentTypes(types);
        setRevisionStatuses(statuses);
      } catch (error) {
        console.error('Error fetching data:', error);
        handleError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const addDocument = (doc: SigDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleResubmit = async (docId: number, file: File) => {
    try {
      // When resubmitting, update the document status to "Corregido" (4)
      const updatedDoc = await updateDocument(docId, { revisionStatusId: 4 }, file);

      // Update the document in the list
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? updatedDoc : d))
      );

      handleSuccess('Documento reenviado exitosamente');
    } catch (error) {
      console.error('Error resubmitting document:', error);
      handleError(error instanceof Error ? error.message : 'Error al reenviar el documento');
    }
  };

  const handleModify = async (docId: number, payload: { version: string; file: File | null }) => {
    try {
      // Modify the document version and/or file without changing status
      const updatedDoc = await updateDocument(docId, { version: payload.version }, payload.file);

      // Update the document in the list
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? updatedDoc : d))
      );

      handleSuccess('Documento modificado exitosamente');
    } catch (error) {
      console.error('Error modifying document:', error);
      handleError(error instanceof Error ? error.message : 'Error al modificar el documento');
    }
  };

  const handleSuccess = (msg = "Documento creado") =>
    setToast({ open: true, message: msg, severity: "success" });

  const handleError = (msg: string) =>
    setToast({ open: true, message: msg, severity: "error" });

  if (loading) {
    return (
      <Box
        component="section"
        sx={{
          width: "100%",
          maxWidth: "100% !important",
          px: { xs: 1, sm: 2, md: 4 },
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="section" sx={{ width: "100%", maxWidth: "100% !important", px: { xs: 1, sm: 2, md: 4 }, py: 4 }}>
      <Box textAlign="left" mb={3}>
        <Typography variant="h4" fontWeight={800} sx={{ color: BLUE }}>
          Gestión de Documentos
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Crear y listar documentos del SIG
        </Typography>
      </Box>

      <DocumentForm
        documentTypes={documentTypes}
        onAdd={addDocument}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      <DocumentTable
        rows={documents}
        documentTypes={documentTypes}
        revisionStatuses={revisionStatuses}
        onResubmit={handleResubmit}
        onModify={handleModify}
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
    </Box>
  );
}