import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Stack,
  Typography,
  Chip,
  Alert,
  FormHelperText,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { createDocument } from "@/services/document.service";
import type { SigDocument, DocumentType } from "@/types/document";

const BLUE = "#142334";
const GREEN = "#279B48";

const isAllowedExt = (name = "") => /\.(pdf|doc|docx|xls|xlsx)$/i.test(name);

type OnAdd = (doc: SigDocument) => void;
type OnMsg = (msg?: string) => void;

interface DocumentFormProps {
  documentTypes: DocumentType[];
  onAdd?: OnAdd;
  onSuccess?: OnMsg;
  onError?: (msg: string) => void;
}

interface FormState {
  codigo: string;
  tipoDocumento: string; // id del tipo como string ("")
  version: string;
  descripcion: string;
  archivo: File | null;
}

export default function DocumentForm({
  documentTypes,
  onAdd,
  onSuccess,
  onError,
}: DocumentFormProps) {
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [form, setForm] = useState<FormState>({
    codigo: "",
    tipoDocumento: "",
    version: "",
    descripcion: "",
    archivo: null,
  });

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const f = e.target.files?.[0];
    if (!f) return;

    if (!isAllowedExt(f.name)) {
      setFileError(
        "Formato no permitido. Sube PDF, Word (.doc/.docx) o Excel (.xls/.xlsx)."
      );
      setForm((prev) => ({ ...prev, archivo: null }));
      onError?.("Formato de archivo no permitido.");
      return;
    }

    setForm((prev) => ({ ...prev, archivo: f }));
  };

  const resetForm = () => {
    setForm({
      codigo: "",
      tipoDocumento: "",
      version: "",
      descripcion: "",
      archivo: null,
    });
    setFileError("");
  };

  /**
   * Envío del formulario:
   * 1) Crea el documento en BD
   * 2) Sube el archivo y lo asocia
   * (Encapsulado en createDocument)
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const required: (keyof FormState)[] = [
        "codigo",
        "tipoDocumento",
        "version",
        "descripcion",
        "archivo",
      ];
      const missing = required.filter((k) => !form[k]);
      if (missing.length) {
        onError?.(`Faltan campos: ${missing.join(", ")}`);
        setLoading(false);
        return;
      }

      const newDocument = await createDocument(
        {
          codigo: form.codigo,
          descripcion: form.descripcion,
          version: form.version,
          tipoDocumentoId: parseInt(form.tipoDocumento),
        },
        form.archivo!
      );

      onAdd?.(newDocument);
      onSuccess?.("Documento creado exitosamente");
      resetForm();
    } catch (error) {
      console.error("Error creating document:", error);
      onError?.(
        error instanceof Error ? error.message : "Error al crear el documento"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 3, width: "100%", maxWidth: "100%", mb: 4 }}>
      <CardContent sx={{ pb: 1, px: { xs: 2, md: 3 } }}>
        {/* Encabezado azul a todo el ancho del card */}
        <Box
          sx={{
            bgcolor: BLUE,
            color: "#fff",
            px: { xs: 2, md: 3 },
            py: 1.25,
            mb: 2.5,
            mx: { xs: -2, md: -3 },
            borderRadius: "12px",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Crear Documento
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Completa los campos y envía para aprobación
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Fila 1: Código | Tipo de documento | Versión (mismo tamaño) */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
              gap: 2,
            }}
          >
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField
                name="codigo"
                label="Código"
                value={form.codigo}
                onChange={handleTextChange}
                fullWidth
                required
                size="medium"
              />
            </Box>

            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              {/* TextField select estándar para igualar altura/estilo */}
              <TextField
                select
                name="tipoDocumento"
                label="Tipo de documento"
                value={form.tipoDocumento} // "" por defecto
                onChange={(e) =>
                  setForm((p) => ({ ...p, tipoDocumento: e.target.value }))
                }
                fullWidth
                required
                size="medium"
              >
                {/* Placeholder solo dentro del menú (no en el campo) */}
                <MenuItem value="" disabled>
                  <em>Selecciona…</em>
                </MenuItem>
                {documentTypes.map((tipo) => (
                  <MenuItem key={tipo.tipId} value={String(tipo.tipId)}>
                    {tipo.tipNombre}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField
                name="version"
                label="Versión"
                value={form.version}
                onChange={handleTextChange}
                fullWidth
                required
                size="medium"
              />
            </Box>
          </Box>

          {/* Separación entre filas */}
          <Box sx={{ mt: 3 }} />

          {/* Descripción ocupa fila completa (limpio y amplio) */}
          <Box sx={{ mb: 3 }}>
            <TextField
              name="descripcion"
              label="Descripción"
              value={form.descripcion}
              onChange={handleTextChange}
              fullWidth
              required
              size="medium"
              multiline
              minRows={4}
            />
          </Box>

          {/* Carga de archivo */}
          <Box>
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Archivo del Documento
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  sx={{
                    minWidth: 220,
                    borderRadius: 2,
                    borderColor: BLUE,
                    color: BLUE,
                    ":hover": { borderColor: BLUE },
                  }}
                >
                  Seleccionar archivo
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                </Button>

                <Stack flex={1}>
                  {form.archivo ? (
                    <Chip
                      label={form.archivo.name}
                      variant="outlined"
                      onDelete={() => {
                        setForm((prev) => ({ ...prev, archivo: null }));
                        setFileError("");
                      }}
                      sx={{ alignSelf: "flex-start" }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Ningún archivo seleccionado
                    </Typography>
                  )}
                  <FormHelperText>
                    Formatos permitidos: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
                  </FormHelperText>
                </Stack>
              </Stack>

              {fileError && <Alert severity="warning">{fileError}</Alert>}
            </Stack>
          </Box>

          {/* Botones */}
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              onClick={resetForm}
              disabled={loading}
              sx={{
                borderColor: BLUE,
                color: BLUE,
                ":hover": { borderColor: BLUE },
                py: 0.8,
                px: 3,
              }}
            >
              Limpiar
            </Button>

            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} /> : null}
              sx={{ bgcolor: GREEN, ":hover": { bgcolor: "#1f7d3a" }, py: 0.9, px: 3.5 }}
            >
              {loading ? "Enviando…" : "Enviar para aprobación"}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
