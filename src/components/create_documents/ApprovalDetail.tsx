import * as React from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  Stack,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  Alert,
  TextField,
} from "@mui/material";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import type { SigDocument } from "@/types/document";
import { viewDocumentacionFile } from "@/services/file.service";

const BLUE = "#142334";
const GREEN = "#279B48";

export interface ApprovalDetailProps {
  open: boolean;
  doc: SigDocument | null;
  onClose: () => void;
  onApproved: (id: number) => void;
  onRejected: (id: number, reason?: string) => void;
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}): React.ReactElement {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

export default function ApprovalDetail({
  open,
  doc,
  onClose,
  onApproved,
  onRejected,
}: ApprovalDetailProps): React.ReactElement {
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const estadoLower = (doc?.revisionStatusName || "").toLowerCase();
  const isFinal =
    estadoLower === "aprobado" ||
    estadoLower === "devuelto" ||
    estadoLower === "rechazado";
  const isOpen = open && !!doc;

  // Texto "limpio" de la observación (si existe)
  const observationText = doc?.observation ? doc.observation.trim() : "";

  const handleConfirmReject = async () => {
    const text = reason.trim();
    if (text.length < 5) {
      setError("Por favor escribe una observación (mín. 5 caracteres).");
      return;
    }
    if (doc) {
      setIsProcessing(true);
      try {
        await onRejected(doc.id, text);
        setRejectOpen(false);
        setReason("");
        setError("");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleApprove = async () => {
    if (doc) {
      setIsProcessing(true);
      try {
        await onApproved(doc.id);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleViewDocument = () => {
    if (doc) {
      viewDocumentacionFile(doc.id).catch((error) => {
        console.error("Error viewing document:", error);
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      {/* TÍTULO */}
      <DialogTitle
        sx={{
          bgcolor: BLUE,
          color: "#fff",
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {doc
              ? `${doc.documentTypeName} — v${doc.version}`
              : "Detalle del documento"}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {doc?.descripcion ?? "—"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#fff" }} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* CONTENIDO */}
      <DialogContent sx={{ pt: 3 }}>
        {/* Chip de estado */}
        {doc && (
          <Chip
            label={doc.revisionStatusName}
            size="small"
            sx={{
              bgcolor:
                estadoLower === "aprobado"
                  ? "#DFF5E1"
                  : estadoLower === "devuelto" || estadoLower === "rechazado"
                  ? "#FDECEC"
                  : "#f4f4f4",
              color:
                estadoLower === "aprobado"
                  ? GREEN
                  : estadoLower === "devuelto" || estadoLower === "rechazado"
                  ? "#D32F2F"
                  : BLUE,
              fontWeight: 700,
              mb: 2,
            }}
          />
        )}

        {/* Datos básicos */}
        {doc && <InfoRow label="Proceso" value={doc.processName} />}
        {doc && <InfoRow label="Creado por" value={doc.createdByUserName} />}

        {/* Razón del rechazo */}
        {observationText && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "#FFF4E5",
              borderRadius: 2,
              borderLeft: "4px solid #FF9800",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              Razón del rechazo:
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
              {observationText}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Flujo de trabajo */}
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Flujo de Trabajo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Documento creado por{" "}
          <strong>{doc?.createdByUserName || "—"}</strong>
        </Typography>

        {/* BOTONES PRINCIPALES */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mb: 2 }}
        >
          <Button
            variant="outlined"
            disabled={!doc}
            sx={{
              borderColor: BLUE,
              color: BLUE,
              ":hover": { borderColor: BLUE },
            }}
            onClick={handleViewDocument}
          >
            Ver PDF
          </Button>
          <Button
            variant="outlined"
            color="warning"
            disabled={isFinal || !doc || isProcessing}
            onClick={() => setRejectOpen(true)}
            sx={{
              opacity: isFinal || isProcessing ? 0.5 : 1,
              cursor: isFinal || isProcessing ? "not-allowed" : "pointer",
            }}
          >
            Rechazar
          </Button>
          <Button
            variant="contained"
            disabled={isFinal || !doc || isProcessing || rejectOpen}
            sx={{
              bgcolor: GREEN,
              ":hover": { bgcolor: "#1f7d3a" },
              opacity: isFinal || isProcessing || rejectOpen ? 0.5 : 1,
              cursor:
                isFinal || isProcessing || rejectOpen
                  ? "not-allowed"
                  : "pointer",
            }}
            onClick={handleApprove}
          >
            {isProcessing ? "Procesando..." : "Aprobar"}
          </Button>
        </Stack>

        {/* ALERTA DE ESTADO FINAL */}
        {isFinal && (
          <Alert
            severity={estadoLower === "aprobado" ? "success" : "error"}
            variant="outlined"
            sx={{
              borderColor:
                estadoLower === "aprobado" ? GREEN : "rgba(211, 47, 47, 0.5)",
              color: estadoLower === "aprobado" ? GREEN : "#D32F2F",
              fontWeight: 600,
              textAlign: "center",
              mt: 2,
            }}
          >
            {estadoLower === "aprobado"
              ? "Este documento ya fue aprobado. No es posible modificar su estado."
              : "Este documento fue rechazado. No es posible modificar su estado."}
          </Alert>
        )}

        {/* MODAL DE RECHAZO */}
        <Dialog
          open={rejectOpen}
          onClose={() => setRejectOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Rechazar documento</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Describe brevemente el motivo por el cual el documento es
              rechazado.
            </Typography>
            <TextField
              autoFocus
              multiline
              minRows={3}
              fullWidth
              placeholder="Ej.: Falta la firma del responsable y el anexo 2"
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              error={Boolean(error)}
              helperText={error || ""}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setRejectOpen(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleConfirmReject}
              disabled={isProcessing}
            >
              {isProcessing ? "Procesando..." : "Confirmar rechazo"}
            </Button>
          </DialogActions>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
