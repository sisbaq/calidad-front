import { useState, useMemo, Fragment } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  Collapse,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import type { AuditPlan, AuditReport } from '@/types/audit';
import { BRAND_BLUE } from '@/constants/audit.constants';
import { viewPlanAuditoriaFile, viewInformeAuditoriaFile } from '@/services/file.service';

const fmtDate = (iso: string) => {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return '—';
  }
};

interface PlansTableProps {
  plans: AuditPlan[];
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (plan: AuditPlan) => void;
  onDelete: (plan: AuditPlan) => void;
  onReportAdd: (mode: 'create', planId: number | string) => void;
  onReportEdit: (mode: 'edit', planId: number | string, report: AuditReport) => void;
  onReportDelete: (planId: number | string, report: AuditReport) => void;
}

export default function PlansTable({
  plans,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onReportAdd,
  onReportEdit,
  onReportDelete,
}: PlansTableProps) {
  const [query, setQuery] = useState('');
  const [openRows, setOpenRows] = useState(() => new Set<string | number>());

  const filteredPlans = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter((p) => {
      const haystack = [
        p.planLabel,
        p.description,
        p.fileMeta?.name,
        ...(p.reports || []).map((r) => r.name),
        fmtDate(p.createdAt),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [plans, query]);

  const toggleRow = (id: string | number) => {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cellWrap = { whiteSpace: 'normal', wordBreak: 'break-word' as const };
  const cellNoWrap = { whiteSpace: 'nowrap' as const };

  return (
    <>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ color: BRAND_BLUE }}>
          Planes cargados
        </Typography>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por tipo, descripción o archivo..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', md: 360 } }}
        />
      </Stack>

      <TableContainer>
        <Table size="small" aria-label="Listado de planes" sx={{ tableLayout: 'auto' }}>
          <TableHead>
            <TableRow>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Descripción</strong></TableCell>
              <TableCell><strong>Plan de Auditoría</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
              <TableCell><strong>Informe asociado</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">
                    {plans.length === 0 ? 'Aún no se han cargado planes.' : 'Sin resultados para tu búsqueda.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPlans.map((p) => {
                const isOpen = openRows.has(p.id);
                return (
                  <Fragment key={p.id}>
                    <TableRow hover>
                      <TableCell sx={cellNoWrap}>{fmtDate(p.createdAt)}</TableCell>

                      <TableCell sx={cellWrap}>{p.planLabel}</TableCell>
                      <TableCell sx={cellWrap}>{p.description || '—'}</TableCell>

                      <TableCell sx={cellWrap}>
                        {p.fileMeta?.name ? (
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {p.fileMeta.name}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={() => viewPlanAuditoriaFile(p.id).catch(console.error)}
                              sx={{
                                borderColor: BRAND_BLUE,
                                color: BRAND_BLUE,
                                fontWeight: 600,
                                alignSelf: 'flex-start',
                              }}
                            >
                              VER PLAN
                            </Button>
                          </Stack>
                        ) : (
                          '—'
                        )}
                      </TableCell>

                      <TableCell>
                        <Tooltip title="Editar plan">
                          <IconButton size="small" onClick={() => onEdit(p)} sx={{ color: BRAND_BLUE }}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar plan">
                          <IconButton size="small" onClick={() => onDelete(p)} sx={{ color: BRAND_BLUE }}>
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Tooltip title="Ver información del informe de auditoría">
                            <IconButton size="small" onClick={() => toggleRow(p.id)} sx={{ color: BRAND_BLUE }}>
                              {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                          </Tooltip>
                          <Button
                            variant="contained"
                            startIcon={<UploadFileIcon />}
                            disabled={p.reports.length !== 0}
                            sx={{ bgcolor: BRAND_BLUE, '&:hover': { bgcolor: BRAND_BLUE }, fontWeight: 600 }}
                            onClick={() => onReportAdd('create', p.id)}
                          >
                            SUBIR INFORME
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 0, bgcolor: (t) => t.palette.action.hover }}>
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ px: 2, py: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: BRAND_BLUE }}>
                              Informes asociados
                            </Typography>

                            {(p.reports?.length || 0) === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                No hay informes asociados.
                              </Typography>
                            ) : (
                              <Box
                                sx={{
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                }}
                              >
                                <Table size="small" sx={{ tableLayout: 'auto' }}>
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: 'background.paper' }}>
                                      <TableCell><strong>Descripción</strong></TableCell>
                                      <TableCell><strong>Fecha</strong></TableCell>
                                      <TableCell><strong>Acciones</strong></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {p.reports!.map((r) => (
                                      <TableRow key={r.id}>
                                        <TableCell sx={cellWrap}>{r.desc || '—'}</TableCell>
                                        <TableCell sx={cellNoWrap}>{fmtDate(r.createdAt)}</TableCell>
                                        <TableCell>
                                          <Stack direction="row" spacing={1} alignItems="center">
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              startIcon={<VisibilityIcon />}
                                              onClick={() => viewInformeAuditoriaFile(r.id).catch(console.error)}
                                              sx={{
                                                borderColor: BRAND_BLUE,
                                                color: BRAND_BLUE,
                                                fontWeight: 600,
                                              }}
                                            >
                                              VER
                                            </Button>
                                            <Tooltip title="Editar informe (archivo y descripción)">
                                              <IconButton
                                                size="small"
                                                onClick={() => onReportEdit('edit', p.id, r)}
                                                sx={{ color: BRAND_BLUE }}
                                              >
                                                <EditRoundedIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar informe">
                                              <IconButton
                                                size="small"
                                                onClick={() => onReportDelete(p.id, r)}
                                                sx={{ color: BRAND_BLUE }}
                                              >
                                                <DeleteRoundedIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          </Stack>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            )}
                          </Box>
                          <Divider />
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
        getItemAriaLabel={(type) =>
          type === 'next'
            ? 'Siguiente página'
            : type === 'first'
              ? 'Primera página'
              : type === 'last'
                ? 'Última página'
                : 'Página anterior'
        }
      />
    </>
  );
}
