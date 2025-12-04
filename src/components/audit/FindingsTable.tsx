import {
  Box, Divider, IconButton, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OverflowTooltip from "@/components/common/OverflowTooltip";
import { useState, useCallback, type KeyboardEvent } from "react";
import type { Finding } from "@/types/audit";

interface FindingsTableProps {
  items: Finding[];
  onEdit: (item: Finding) => void;
  onDelete: (item: Finding) => void;
}

const DESC_LINES = 3;
const LINE_PX = 20;
const DESC_MAX_HEIGHT = DESC_LINES * LINE_PX;

export default function FindingsTable({ items, onEdit, onDelete }: FindingsTableProps) {
  const [preview, setPreview] = useState<{ open: boolean; item: Finding | null }>({
    open: false,
    item: null,
  });

  const openPreview = useCallback((item: Finding) => setPreview({ open: true, item }), []);
  const closePreview = useCallback(() => setPreview({ open: false, item: null }), []);

  const onKeyOpen = (e: KeyboardEvent<HTMLDivElement>, item: Finding) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPreview(item);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Hallazgos registrados ({items.length})
      </Typography>
      <Divider sx={{ mb: 1 }} />

      <Box sx={{ maxHeight: 420, overflow: "auto" }}>
        <Table
          size="small"
          stickyHeader
          sx={{
            tableLayout: "fixed",
            minWidth: 1100,
            "& td, & th": { py: 1.25, px: 1.25, verticalAlign: "top" },
          }}
        >
          <colgroup>
            <col style={{ width: "10%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "5%" }} />
          </colgroup>

          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Proceso</TableCell>
              <TableCell>Tipo auditoría</TableCell>
              <TableCell>Tipo hallazgo</TableCell>
              <TableCell>Fuente</TableCell>
              <TableCell>Numeral</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((it) => (
              <TableRow key={it.id} hover>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{it.date}</TableCell>

                <TableCell>
                  <OverflowTooltip sx={{ whiteSpace: "nowrap" }}>{it.auditedProcess}</OverflowTooltip>
                </TableCell>

                <TableCell>
                  <OverflowTooltip sx={{ whiteSpace: "nowrap" }}>{it.auditType}</OverflowTooltip>
                </TableCell>

                <TableCell>
                  <OverflowTooltip sx={{ whiteSpace: "nowrap" }}>{it.findingType}</OverflowTooltip>
                </TableCell>

                <TableCell>
                  <OverflowTooltip sx={{ whiteSpace: "nowrap" }}>{it.source}</OverflowTooltip>
                </TableCell>

                <TableCell>
                  <OverflowTooltip sx={{ whiteSpace: "nowrap" }}>{it.requirementNumeral}</OverflowTooltip>
                </TableCell>

                <TableCell>
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => openPreview(it)}
                    onKeyDown={(e) => onKeyOpen(e, it)}
                    title="Ver descripción completa"
                    sx={{
                      cursor: "pointer",
                      lineHeight: `${LINE_PX}px`,
                      maxHeight: `${DESC_MAX_HEIGHT}px`,
                      overflow: "hidden",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      ["&:not(:empty)"]: {
                        display: "-webkit-box",
                        WebkitLineClamp: DESC_LINES,
                        WebkitBoxOrient: "vertical",
                      },
                      maskImage:
                        "linear-gradient(180deg, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
                      WebkitMaskImage:
                        "linear-gradient(180deg, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
                      pr: 1,
                    }}
                  >
                    {it.description}
                  </Box>
                </TableCell>

                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => onEdit(it)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => onDelete(it)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No hay hallazgos aún
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={preview.open} onClose={closePreview} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Descripción del hallazgo</DialogTitle>
        <DialogContent dividers sx={{ "& p": { mb: 0 } }}>
          <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {preview.item?.description || ""}
          </Typography>

          {preview.item?.condition && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Condición
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {preview.item.condition}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
