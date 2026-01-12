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
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import type { ContextMatrix } from "@/types/organization-context";
import { downloadContextoOrganizacionFile } from "@/services/file.service";

type Props = {
  rows?: ContextMatrix[];
  onDelete?: (id: number) => void;
  onEdit?: (matrix: ContextMatrix) => void;
  showActions?: boolean;    // Controls whether to show ALL action buttons (download, edit, delete)
  showDownloadOnly?: boolean;  // Show only download button (for read-only views)
  title?: string;  // Custom title for the card header
};

export default function StakeholderMatrixTable({ 
  rows = [], 
  onDelete, 
  onEdit, 
  showActions = true,
  showDownloadOnly = false,
  title = "Matrices cargadas",
}: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [confirm, setConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

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

  const handleDownload = (row: ContextMatrix) => {
    downloadContextoOrganizacionFile(row.id).catch(console.error);
  };

  const askDelete = (row: ContextMatrix) => setConfirm({ open: true, id: row.id });
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
        title={title}
      />

      <Box sx={{ p: 2 }}>
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 120, fontWeight: 600, color: "primary.main" }}>Vigencia</TableCell>
                  <TableCell sx={{ width: 200, fontWeight: 600, color: "primary.main" }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>Descripción</TableCell>
                  <TableCell sx={{ width: 200, fontWeight: 600, color: "primary.main" }}>Estado</TableCell>
                  {(showActions || showDownloadOnly) && (
                    <TableCell align="left" sx={{ width: showDownloadOnly ? 100 : 220, fontWeight: 600, color: "primary.main" }}>
                      Acciones
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={(showActions || showDownloadOnly) ? 5 : 4}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Aún no se han cargado matrices.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.fiscalYear}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.type.name || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.description}</Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color={row.status ? 'success' : 'error'}
                          sx={{ borderColor: row.status ? 'success.main': 'error.main' }}
                        >
                          {row.status ? 'Activa' : 'Inactiva'}
                        </Button>
                      </TableCell>
                      {(showActions || showDownloadOnly) && (
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              onClick={() => handleDownload(row)}
                              sx={{ borderColor: "success.main", "&:hover": { borderColor: "success.main" } }}
                            >
                              <DownloadIcon fontSize="small"/>
                            </Button>
                            
                            {!showDownloadOnly && (
                              <>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => onEdit?.(row)}
                                >
                                  <EditIcon fontSize="small"/>
                                </Button>
                                
                                <Button size="small" variant="outlined" color="error" onClick={() => askDelete(row)}>
                                  <DeleteIcon fontSize="small" />
                                </Button>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      )}
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
