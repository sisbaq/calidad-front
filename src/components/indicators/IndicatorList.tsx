import type { FC } from 'react';
import { Box, Button, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { appColors } from '@/theme/colors';
import type { Indicator } from '../../types/indicators';
import { PERIODICITY_CONFIG} from '../../types/indicators';

interface IndicatorListProps {
  indicators: Indicator[];
  onManage: (indicator: Indicator) => void;
  onEdit: (indicator: Indicator) => void;
  onDelete: (indicator: Indicator) => void;
}

const getStateFromDates = (lastUpdate: string | undefined, periodicity: Indicator['periodicity']) => {
  const now = new Date();
  const addMonthsByPeriod = (p: string) => {
    switch (p) {
      case 'MENSUAL':
        return 1;
      case 'BIMESTRAL':
        return 2;
      case 'TRIMESTRAL':
        return 3;
      case 'CUATRIMESTRAL':
        return 4;
      case 'SEMESTRAL':
        return 6;
      case 'ANUAL':
        return 12;
      default:
        return 1;
    }
  };


  if (!lastUpdate) {
    return { label: 'Pendiente', color: '#d32f2f' };
  }

  const last = new Date(lastUpdate);
  const monthsToAdd = addMonthsByPeriod(periodicity);
  const deadline = new Date(last);
  deadline.setMonth(deadline.getMonth() + monthsToAdd);

  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 7) {
    return { label: 'Actualizado', color: '#2e7d32' };
  }

  if (diffDays > 0 && diffDays <= 7) {
    return { label: 'Próximo a vencer', color: '#f57c00' };
  }

  return { label: 'Vencido', color: '#d32f2f' };
};

export const IndicatorList: FC<IndicatorListProps> = ({ indicators, onManage, onEdit, onDelete }) => {
  const total = indicators.length;

  const getPeriodInfo = (indicator: Indicator) => {
    const config = PERIODICITY_CONFIG.find((p) => p.value === indicator.periodicity) ?? PERIODICITY_CONFIG[0];
    const periods = config.periods;
    const metaPorPeriodo = periods > 0 ? indicator.annualTarget / periods : indicator.annualTarget;
    return { label: config.label, metaPorPeriodo };
  };

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 1, border: '1px solid #e0e0e0' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: appColors.blue }}>
          Indicadores creados
        </Typography>

        <Box sx={{ px: 1.5, py: 0.5, borderRadius: 999, backgroundColor: '#f3f4f6', fontSize: 12, color: 'text.secondary' }}>
          {total === 1 ? '1 indicador' : `${total} indicadores`}
        </Box>
      </Box>

      {total === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Aún no has creado indicadores. Usa el botón "Nuevo indicador" para registrar el primero.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nombre del Indicador</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tendencia</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Unidad</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Responsable</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Acciones</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Gestionar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {indicators.map((indicator) => {
                const { label } = getPeriodInfo(indicator);
                const state = getStateFromDates(indicator.lastUpdate, indicator.periodicity);
                const disabledActions = indicator.hasData === true;

                return (
                  <TableRow key={indicator.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{indicator.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {label} · Fórmula: <span style={{ fontFamily: 'monospace' }}>{indicator.formula}</span>
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: 0.5, backgroundColor: state.color, mr: 1 }} />
                        <Box sx={{ backgroundColor: state.color + '1A', px: 1, py: 0.5, borderRadius: 0.75 }}>
                          <Typography variant="caption" sx={{ color: state.color, fontWeight: 700 }}>
                            {state.label}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{indicator.trend === 'ASC' ? 'Ascendente' : 'Descendente'}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{indicator.unit}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{(indicator as any).responsible ?? '-'}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title={disabledActions ? 'No se puede editar indicador gestionado' : 'Editar indicador'}>
                          <span>
                            <IconButton size="small" onClick={() => onEdit(indicator)} disabled={disabledActions}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={disabledActions ? 'No se puede eliminar indicador gestionado' : 'Eliminar indicador'}>
                          <span>
                            <IconButton size="small" onClick={() => onDelete(indicator)} disabled={disabledActions} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Button variant="outlined" size="small" startIcon={<VisibilityIcon />} sx={{ textTransform: 'none', borderColor: appColors.blue, color: appColors.blue, '&:hover': { borderColor: appColors.blue, backgroundColor: '#f3f6fb' } }} onClick={() => onManage(indicator)}>
                        Gestionar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
