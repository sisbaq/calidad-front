import * as React from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, Tooltip, TablePagination
} from '@mui/material';
import type { ChipProps } from '@mui/material/Chip';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { ImprovementPlanWithDetails } from '@/types/improvement';

export type PlanEstado = 'Abierto' | 'Cerrado' | 'Vencido' | string;

interface PlanesTableProps {
  rows?: ImprovementPlanWithDetails[];
  colorPrimary?: string;
  onVer?: (row: ImprovementPlanWithDetails) => void;
  onCerrar?: (row: ImprovementPlanWithDetails) => void;
}

const estadoColor = (estado: PlanEstado): ChipProps['color'] => {
  const map: Record<string, ChipProps['color']> = {
    Abierto: 'info',
    Cerrado: 'success',
    Vencido: 'error',
  };
  return map[estado] ?? 'default';
};

export default function PlanesTable({
  rows = [],
  colorPrimary = '#142334',
  onVer,
  onCerrar,
}: PlanesTableProps) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const total = rows.length;
  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  const visibleRows = React.useMemo(() => rows.slice(start, end), [rows, start, end]);

  const mapStatus = (status: number): PlanEstado => {
    const map: Record<number, PlanEstado> = { 1: 'Abierto', 2: 'Cerrado', 3: 'Vencido' };
    return map[status] || 'Abierto';
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const hasOpenActivities = (plan: ImprovementPlanWithDetails): boolean => {
    if (!plan.activities || plan.activities.length === 0) return false;
    return plan.activities.some((activity) => !activity.closed);
  };

  return (
    <Paper
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}
    >
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {['Proceso', 'No. Hallazgo', 'Descripción Hallazgo', 'Responsable', 'Estado', 'Vencimiento', 'Acciones'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: colorPrimary }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleRows.map((r) => {
              const statusText = mapStatus(r.status);
              const hasOpen = hasOpenActivities(r);
              const closeDisabled = statusText === 'Cerrado' || hasOpen;
              const closeTooltip = statusText === 'Cerrado'
                ? 'El plan ya está cerrado'
                : hasOpen
                  ? 'Cierre no disponible: hay actividades abiertas'
                  : 'Cerrar plan';
              return (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.processName}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {r.findingId ?? '—'}
                  </TableCell>
                  <TableCell>{r.findingDescription}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.responsibleName}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={statusText}
                      color={estadoColor(statusText)}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(r.endDate)}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Ver detalle">
                      <IconButton onClick={() => onVer?.(r)} sx={{ color: colorPrimary }}>
                        <VisibilityOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={closeTooltip}>
                      <span>
                        <IconButton
                          onClick={() => onCerrar?.(r)}
                          sx={{ color: colorPrimary }}
                          disabled={closeDisabled}
                        >
                          <CheckCircleOutlineIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {total === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No hay planes para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_e, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '& .MuiTablePagination-actions button': { color: colorPrimary },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { mx: 1 },
        }}
      />
    </Paper>
  );
}
