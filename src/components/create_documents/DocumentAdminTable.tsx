import { useState, useMemo, useRef } from "react";
import {
  Card, CardContent, Chip, IconButton, Typography,
  TextField, Button, Tooltip, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination, Stack,
  Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Box,
  Alert, FormHelperText,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import ReplayIcon from "@mui/icons-material/Replay";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import TruncatedTextModal from "@/components/common/TruncatedTextModal";
import { downloadDocumentacionFile } from "@/services/file.service";

import type { SigDocument, DocumentType, RevisionStatus } from "@/types/document";

const BLUE = "#142334";
const GREEN = "#279B48";

function formatOnlyDate(value?: string | Date | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

interface DocumentTableProps {
  rows: SigDocument[];
  documentTypes: DocumentType[];
  revisionStatuses: RevisionStatus[];
  onResubmit?: (rowId: number, file: File) => void;
  onModify?: (rowId: number, payload: { version: string; file: File | null }) => void;
}

interface FiltersState {
  codigo: string;
  tipo: string | null;
  estado: string | null;
  descripcion: string;
}

type DocWithVersion = SigDocument & {
  version?: string;
  docVersion?: string;
};

const ESTADO_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  "por revisar": { bg: BLUE, color: "#fff", label: "Por revisar" },
  "aprobado": { bg: GREEN, color: "#fff", label: "Aprobado" },
  "devuelto": { bg: "#DC2626", color: "#fff", label: "Devuelto" },
  "corregido": { bg: "#EAB308", color: "#fff", label: "Corregido" },
};

export default function DocumentTable({
  rows,
  documentTypes,
  revisionStatuses,
  onResubmit,
  onModify,
}: DocumentTableProps) {
  const [filters, setFilters] = useState<FiltersState>({
    codigo: "",
    tipo: null,
    estado: null,
    descripcion: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rowIdWaitingRef = useRef<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRow, setDialogRow] = useState<SigDocument | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<SigDocument | null>(null);
  const [editVersion, setEditVersion] = useState<string>("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editError, setEditError] = useState<string>("");
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const clearFilters = () =>
    setFilters({ codigo: "", tipo: null, estado: null, descripcion: "" });

  const filteredRows = useMemo(() => {
    const f = {
      codigo: filters.codigo.trim().toLowerCase(),
      tipo: filters.tipo?.trim().toLowerCase() || null,
      estado: filters.estado?.trim().toLowerCase() || null,
      descripcion: filters.descripcion.trim().toLowerCase(),
    };
    return (rows || []).filter((row) => {
      const codigo = (row.codigo || "").toLowerCase();
      const tipo = (row.documentTypeName || "").toLowerCase();
      const estado = (row.revisionStatusName || "").toLowerCase();
      const descripcion = (row.descripcion || "").toLowerCase();

      const matchCodigo = !f.codigo || codigo.includes(f.codigo);
      const matchTipo = !f.tipo || tipo === f.tipo;
      const matchEstado = !f.estado || estado === f.estado;
      const matchDesc = !f.descripcion || descripcion.includes(f.descripcion);

      return matchCodigo && matchTipo && matchEstado && matchDesc;
    });
  }, [rows, filters]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredRows.slice(start, end);
  }, [filteredRows, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const requestResubmitFor = (rowId: number, row: SigDocument) => {
    rowIdWaitingRef.current = rowId;
    setDialogRow(row);
    setDialogOpen(true);
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file || !rowIdWaitingRef.current) return;
    onResubmit?.(rowIdWaitingRef.current, file);
    setDialogOpen(false);
    setDialogRow(null);
    rowIdWaitingRef.current = null;
  };

  const openEdit = (row: SigDocument) => {
    const r = row as DocWithVersion;
    setEditRow(row);
    setEditVersion(String(r.version ?? r.docVersion ?? ""));
    setEditFile(null);
    setEditError("");
    setEditOpen(true);
  };

  const chooseEditFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (f) {
      setEditFile(f);
      setEditError("");
    }
  };

  const saveEdit = () => {
    if (!editRow) return;

    if (!editFile) {
      setEditError("Debes adjuntar el archivo actualizado (obligatorio).");
      return;
    }

    setEditError("");
    onModify?.((editRow.id as number) ?? 0, { version: editVersion.trim(), file: editFile });
    setEditOpen(false);
    setEditRow(null);
    setEditFile(null);
  };

  const rectControlSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: 48,
      borderRadius: "6px !important",
    },
    "& .MuiOutlinedInput-notchedOutline": { borderWidth: 1 },
    "& .MuiInputBase-input": { fontSize: 14, padding: "12px 14px" },
    "& .MuiInputLabel-root": { fontSize: 14 },
    "& label.Mui-focused": { color: BLUE },
    "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: BLUE },
    "& .MuiAutocomplete-endAdornment": { right: 10 },
  };

  return (
    <Card elevation={3} sx={{ mt: 4, borderRadius: 3, width: "100%", maxWidth: "100%"}}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Ver documentos</Typography>
        <Paper
          square
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            px: 2,
            py: 1.5,
            bgcolor: "background.paper",
            width: "100%",
            mb: 3,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BLUE }}>
              Filtros
            </Typography>
          </Stack>

          <Grid container spacing={1.5} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                name="codigo"
                label="Código"
                value={filters.codigo}
                onChange={handleText}
                fullWidth
                placeholder="Ej: DOC-001"
                sx={rectControlSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Autocomplete
                options={documentTypes.map((dt) => dt.tipNombre.toLowerCase())}
                value={filters.tipo}
                onChange={(_, newValue) => setFilters((prev) => ({ ...prev, tipo: newValue }))}
                isOptionEqualToValue={(option, value) => option === value}
                getOptionLabel={(option) =>
                  option ? option.charAt(0).toUpperCase() + option.slice(1) : ""
                }
                clearOnEscape
                disablePortal
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Tipo de documento"
                    placeholder="Selecciona un tipo"
                    sx={rectControlSx}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Autocomplete
                options={revisionStatuses.map((rs) => rs.edrNomEstado.toLowerCase())}
                value={filters.estado}
                onChange={(_, newValue) => setFilters((prev) => ({ ...prev, estado: newValue }))}
                isOptionEqualToValue={(option, value) => option === value}
                getOptionLabel={(option) =>
                  option ? option.charAt(0).toUpperCase() + option.slice(1) : ""
                }
                clearOnEscape
                disablePortal
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Estado"
                    placeholder="Selecciona un estado"
                    sx={rectControlSx}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                name="descripcion"
                label="Buscar por descripción"
                value={filters.descripcion}
                onChange={handleText}
                fullWidth
                placeholder="Palabra clave…"
                sx={rectControlSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                startIcon={<RestartAltIcon />}
                onClick={clearFilters}
                variant="outlined"
                fullWidth
                sx={{
                  minHeight: 48,
                  borderRadius: "6px !important",
                  fontSize: 14,
                  fontWeight: 700,
                  borderColor: BLUE,
                  color: BLUE,
                  textTransform: "none",
                }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Paper>
        <Paper
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}
        >
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 700, color: BLUE }}>
                    Fecha
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: BLUE }}>Código</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: BLUE }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: BLUE }}>Descripción</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: BLUE }}>
                    Estado
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: BLUE }}>
                    Archivo
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: BLUE }}>
                    Cambiar versión
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: BLUE }}>
                    Reenviar documento
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No hay documentos para mostrar
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row) => {
                    const estadoKey = (row.revisionStatusName || "").toLowerCase();
                    const estadoCfg = ESTADO_COLORS[estadoKey] || {
                      bg: "#E5E7EB",
                      color: "#111827",
                      label: row.revisionStatusName || "—",
                    };
                    const isDevuelto = estadoKey === "devuelto";
                    const isAprobado = estadoKey === "aprobado";
                    const fileEnabled = isAprobado && !!row.fileUrl;

                    const returnReason = row.observation || "";

                    // === REGLA: solo se puede cambiar versión si el documento está aprobado ===
                    const canChangeVersion = isAprobado;

                    return (
                      <TableRow key={row.id} hover>
                        <TableCell align="center">{formatOnlyDate(row.createdAt)}</TableCell>
                        <TableCell>{row.codigo || "—"}</TableCell>
                        <TableCell>{row.documentTypeName || "—"}</TableCell>
                        <TableCell>
                          <TruncatedTextModal
                            content={row.descripcion || ""}
                            title="Descripción Completa"
                            maxWidth="320px"
                            primaryColor={BLUE}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip
                            arrow
                            title={isDevuelto && returnReason ? `Motivo: ${returnReason}` : ""}
                          >
                            <Chip
                              label={estadoCfg.label}
                              size="small"
                              sx={{
                                bgcolor: estadoCfg.bg,
                                color: estadoCfg.color,
                                fontWeight: 600,
                                borderRadius: 1.5,
                              }}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={fileEnabled ? "Descargar PDF" : "No disponible"}>
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                disabled={!fileEnabled}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadDocumentacionFile(row.id).catch(console.error);
                                }}
                                sx={{
                                  border: "1px solid",
                                  borderColor: fileEnabled ? BLUE : "#E5E7EB",
                                  bgcolor: fileEnabled ? "transparent" : "#F3F4F6",
                                }}
                              >
                                <AttachFileIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>

                        {/* Cambiar versión: solo permitido si está Aprobado */}
                        <TableCell align="center">
                          <Tooltip
                            title={
                              canChangeVersion
                                ? "Modificar versión o archivo"
                                : "Solo puedes cambiar la versión cuando el documento está aprobado"
                            }
                          >
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => canChangeVersion && openEdit(row)}
                                disabled={!canChangeVersion}
                                sx={{
                                  minWidth: 36,
                                  width: 36,
                                  height: 36,
                                  p: 0,
                                  borderRadius: 2,
                                  borderColor: BLUE,
                                  color: BLUE,
                                  ":hover": { borderColor: BLUE },
                                }}
                              >
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                              </Button>
                            </span>
                          </Tooltip>
                        </TableCell>

                        <TableCell align="center">
                          {isDevuelto ? (
                            <Tooltip title="Reenviar para aprobación">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => requestResubmitFor((row.id as number) ?? 0, row)}
                                sx={{
                                  minWidth: 36,
                                  width: 36,
                                  height: 36,
                                  p: 0,
                                  borderRadius: 2,
                                  borderColor: GREEN,
                                  color: GREEN,
                                  ":hover": { borderColor: GREEN },
                                }}
                              >
                                <ReplayIcon sx={{ fontSize: 18 }} />
                              </Button>
                            </Tooltip>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              "& .MuiTablePagination-actions button": { color: BLUE },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { mx: 1 },
            }}
          />
        </Paper>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.doc,.docx,.xls,.xlsx"
          hidden
          onChange={onPickFile}
        />
        <Dialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setDialogRow(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: BLUE, color: "#fff" }}>
            Reenviar para aprobación
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {dialogRow && (
              <>
                <Typography variant="subtitle2" sx={{ color: BLUE, fontWeight: 700 }}>
                  {dialogRow.documentTypeName || "Documento"} — {dialogRow.codigo || "—"}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Motivo de devolución
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5 }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {dialogRow.observation || "El revisor devolvió el documento para ajuste."}
                    </Typography>
                  </Paper>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" sx={{ mb: 1 }}>
                  Adjunta el archivo corregido para reenviar a aprobación.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ borderColor: BLUE, color: BLUE, ":hover": { borderColor: BLUE } }}
                >
                  Seleccionar archivo de corrección
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  (PDF, DOC, DOCX, XLS, XLSX)
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setDialogOpen(false);
                setDialogRow(null);
              }}
            >
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: BLUE, color: "#fff" }}>
            Modificar versión del documento
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {editRow && (
              <Stack spacing={2}>
                <Alert severity="info" sx={{ mb: 1 }}>
                  Solo puedes modificar la <strong>versión</strong> y <strong>adjuntar un nuevo archivo</strong>.
                  Los campos <em>Código</em>, <em>Tipo de documento</em> y <em>Descripción</em> son de solo lectura.
                </Alert>

                <TextField
                  label="Código"
                  value={editRow.codigo || ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Tipo de documento"
                  value={editRow.documentTypeName || ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Descripción"
                  value={editRow.descripcion || ""}
                  fullWidth
                  multiline
                  minRows={3}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Versión"
                  value={editVersion}
                  onChange={(e) => setEditVersion(e.target.value)}
                  fullWidth
                />

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    Subir archivo <Typography component="span" color="error">*</Typography>
                  </Typography>

                  <Button
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    onClick={() => editFileInputRef.current?.click()}
                    sx={{ borderColor: BLUE, color: BLUE, ":hover": { borderColor: BLUE } }}
                  >
                    {editFile ? "Cambiar archivo" : "Seleccionar archivo"}
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    (PDF, DOC, DOCX, XLS, XLSX)
                  </Typography>

                  {editFile && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Archivo seleccionado: {editFile.name}
                    </Typography>
                  )}

                  {editError && (
                    <FormHelperText error sx={{ mt: 1 }}>
                      {editError}
                    </FormHelperText>
                  )}
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={saveEdit}
              sx={{ bgcolor: GREEN, ":hover": { bgcolor: "#1f7d3a" } }}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
        <input
          ref={editFileInputRef}
          type="file"
          accept="application/pdf,.doc,.docx,.xls,.xlsx"
          hidden
          onChange={chooseEditFile}
        />
      </CardContent>
    </Card>
  );
}
