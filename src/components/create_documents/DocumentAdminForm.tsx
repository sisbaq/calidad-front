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
import { createTransversalDocument } from "@/services/document.service";
import type { SigDocument, DocumentType } from "@/types/document";
import type { ProcessOption } from "@/types/audit";

const BLUE = "#142334";
const GREEN = "#279B48";

const isAllowedExt = (name = "") => /\.(pdf|doc|docx|xls|xlsx)$/i.test(name);

interface DocumentFormProps {
  onCreate: (doc: SigDocument) => void;
  documentTypes: DocumentType[];
  processes: ProcessOption[];
}

interface FormState {
  codigo: string;
  tipoDocumento: string;
  proceso: string;
  version: string;
  descripcion: string;
  archivo: File | null;
}

export default function DocumentAdminForm({
  onCreate,
  documentTypes,
  processes,
}: DocumentFormProps) {
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [form, setForm] = useState<FormState>({
    codigo: "",
    tipoDocumento: "",
    proceso: "",
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
      return;
    }

    setForm((prev) => ({ ...prev, archivo: f }));
  };

  const resetForm = () => {
    setForm({
      codigo: "",
      tipoDocumento: "",
      proceso: "",
      version: "",
      descripcion: "",
      archivo: null,
    });
    setFileError("");
    setGeneralError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError("");

    try {
      const required: (keyof FormState)[] = [
        "codigo",
        "tipoDocumento",
        "proceso",
        "version",
        "descripcion",
        "archivo",
      ];
      const missing = required.filter((k) => !form[k]);
      if (missing.length) {
        setGeneralError(`Faltan campos: ${missing.join(", ")}`);
        setLoading(false);
        return;
      }

      const newDocument = await createTransversalDocument(
        {
          codigo: form.codigo,
          descripcion: form.descripcion,
          version: form.version,
          tipoDocumentoId: parseInt(form.tipoDocumento),
          procesoId: parseInt(form.proceso),
        },
        form.archivo!
      );

      onCreate(newDocument);
      resetForm();
    } catch (error) {
      console.error("Error creating transversal document:", error);
      setGeneralError(
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
            Crear Documento Transversal
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Completa los campos y carga el archivo del documento
          </Typography>
        </Box>

        {generalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generalError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Fila 1: Código | Tipo de documento | Versión */}
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
              <TextField
                select
                name="tipoDocumento"
                label="Tipo de documento"
                value={form.tipoDocumento}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tipoDocumento: e.target.value }))
                }
                fullWidth
                required
                size="medium"
              >
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

          {/* Fila 2: Proceso (ocupa todo el ancho) */}
          <Box sx={{ mb: 3 }}>
            <TextField
              select
              name="proceso"
              label="Proceso"
              value={form.proceso}
              onChange={(e) =>
                setForm((p) => ({ ...p, proceso: e.target.value }))
              }
              fullWidth
              required
              size="medium"
            >
              <MenuItem value="" disabled>
                <em>Selecciona un proceso…</em>
              </MenuItem>
              {processes.map((proc) => (
                <MenuItem key={proc.id} value={String(proc.id)}>
                  {proc.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Descripción ocupa fila completa */}
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
              {loading ? "Guardando…" : "Guardar documento"}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
