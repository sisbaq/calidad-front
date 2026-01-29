import type { FC } from 'react';
import { Box, Button, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { appColors } from '@/theme/colors';
import type { Indicator } from '../../types/indicators';
import { PERIODICITY_CONFIG } from '../../types/indicators';

interface IndicatorListProps {
  indicators: Indicator[];
  onManage: (indicator: Indicator) => void;
  onEdit: (indicator: Indicator) => void;
  onDelete: (indicator: Indicator) => void;
}

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
          Aun no has creado indicadores. Usa el boton "Nuevo indicador" para registrar el primero.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nombre del Indicador</TableCell>
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

                return (
                  <TableRow key={indicator.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{indicator.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {label} · Formula: <span style={{ fontFamily: 'monospace' }}>{indicator.formula}</span>
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{indicator.trend === 'ASC' ? 'Ascendente' : 'Descendente'}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{indicator.unit}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{indicator.responsible ?? '-'}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Editar indicador">
                          <IconButton size="small" onClick={() => onEdit(indicator)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar indicador">
                          <IconButton size="small" onClick={() => onDelete(indicator)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
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
