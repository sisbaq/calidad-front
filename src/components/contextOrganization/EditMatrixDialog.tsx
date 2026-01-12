import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import type { ContextMatrix } from "@/types/organization-context";

interface Props {
  open: boolean;
  matrix: ContextMatrix | null;
  onClose: () => void;
  onSave: (id: number, description: string, file: File | null) => Promise<void>;
}

const isAllowedExt = (name = "") => /\.(pdf|doc|docx|xls|xlsx)$/i.test(name);

export default function EditMatrixDialog({ open, matrix, onClose, onSave }: Props) {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [descriptionError, setDescriptionError] = useState("");
  const [fileError, setFileError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (matrix && open) {
      setDescription(matrix.description);
      setFile(null);
      setDescriptionError("");
      setFileError("");
    }
  }, [matrix, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!isAllowedExt(selectedFile.name)) {
      setFileError("Formato no permitido. Usa PDF, DOC/DOCX o XLS/XLSX.");
      setFile(null);
      return;
    }

    setFileError("");
    setFile(selectedFile);
  };

  const handleSave = async () => {
    if (!description.trim()) {
      setDescriptionError("La descripción es obligatoria.");
      return;
    }

    if (!matrix) return;

    try {
      setIsSaving(true);
      await onSave(matrix.id, description.trim(), file);
      handleClose();
    } catch (error) {
      console.debug("Error in EditMatrixDialog:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setDescription("");
    setFile(null);
    setDescriptionError("");
    setFileError("");
    onClose();
  };

  if (!matrix) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar matriz</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Vigencia"
            value={matrix.fiscalYear}
            disabled
            fullWidth
            size="small"
          />

          <TextField
            label="Tipo"
            value={matrix.type.name}
            disabled
            fullWidth
            size="small"
          />

          <TextField
            label="Estado"
            value={matrix.status ? "Activa" : "Inactiva"}
            disabled
            fullWidth
            size="small"
          />

          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (descriptionError) setDescriptionError("");
            }}
            error={!!descriptionError}
            helperText={descriptionError || " "}
            required
            fullWidth
            multiline
            rows={3}
            size="small"
          />

          <Box>
            <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
              Archivo actual:{" "}
              <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
                {matrix.document ? matrix.document.split("/").pop() : "Sin archivo"}
              </Typography>
            </Typography>

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
              sx={{ borderColor: "primary.main", "&:hover": { borderColor: "primary.main" } }}
            >
              {file ? file.name : "Seleccionar nuevo archivo (opcional)"}
              <input type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileChange} />
            </Button>

            {fileError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                {fileError}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving} sx={{ bgcolor: "#142334" }}>
          {isSaving ? <CircularProgress size={24} color="inherit" /> : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
