import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Divider,
  Card,
  CardHeader,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";

type MatrixRow = {
  id: string;
  fecha: string;            // ISO date string
  descripcion: string;
  nombre: string;
  size: number;             // bytes
  type?: string | null;
  url: string;
};

type Props = {
  rows?: MatrixRow[];
  onDelete?: (id: string) => void;
};

function formatDateISOToLocal(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function StakeholderMatrixTable({ rows = [], onDelete }: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [confirm, setConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const total = rows.length;
  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleView = (row: MatrixRow) => window.open(row.url, "_blank", "noopener,noreferrer");
  const handleDownload = (row: MatrixRow) => {
    const a = document.createElement("a");
    a.href = row.url;
    a.download = row.nombre || "matriz";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const askDelete = (row: MatrixRow) => setConfirm({ open: true, id: row.id });
  const closeConfirm = () => setConfirm({ open: false, id: null });
  const doDelete = () => {
    if (confirm.id) onDelete?.(confirm.id);
    closeConfirm();
  };

  return (
    <Card elevation={0} sx={{ border: "1px solid #EAEAEA", borderRadius: 3, mt: 2 }}>
      <CardHeader
        sx={{ pb: 0, alignItems: "center" }}
        avatar={
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "999px",
              bgcolor: "#279B48",
              display: "grid",
              placeItems: "center",
            }}
          >
            <InsertDriveFileRoundedIcon sx={{ color: "#fff" }} />
          </Box>
        }
        titleTypographyProps={{ variant: "h6", sx: { fontWeight: 700, color: "primary.main" } }}
        title="Matrices cargadas"
      />

      <Box sx={{ p: 2 }}>
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 120, fontWeight: 600, color: "primary.main" }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>Descripción</TableCell>
                  <TableCell sx={{ width: 280, fontWeight: 600, color: "primary.main" }}>Archivo</TableCell>
                  <TableCell align="left" sx={{ width: 220, fontWeight: 600, color: "primary.main" }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Aún no se han cargado matrices.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{formatDateISOToLocal(row.fecha)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.descripcion}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {row.nombre}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {row.type || "archivo"} · {(row.size / 1024).toFixed(1)} KB
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleView(row)}
                            sx={{ borderColor: "success.main", "&:hover": { borderColor: "success.main" } }}
                          >
                            Ver
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownload(row)}
                            sx={{ borderColor: "primary.main", "&:hover": { borderColor: "primary.main" } }}
                          >
                            Descargar
                          </Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => askDelete(row)}>
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider />

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      </Box>

      <Dialog open={confirm.open} onClose={closeConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar archivo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de eliminar este archivo? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={doDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
