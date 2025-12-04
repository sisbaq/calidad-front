import type { FC } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { appColors } from '@/theme/colors';
import type { Indicator } from '../../types/indicators';
import {
  PERIODICITY_CONFIG,
  formatNumber,
} from '../../types/indicators';

interface IndicatorListProps {
  indicators: Indicator[];
  onManage: (indicator: Indicator) => void;
  onEdit: (indicator: Indicator) => void;
  onDelete: (indicator: Indicator) => void;
}

export const IndicatorList: FC<IndicatorListProps> = ({
  indicators,
  onManage,
  onEdit,
  onDelete,
}) => {
  const total = indicators.length;

  const getPeriodInfo = (indicator: Indicator) => {
    const config =
      PERIODICITY_CONFIG.find(
        (p) => p.value === indicator.periodicity,
      ) ?? PERIODICITY_CONFIG[0];

    const periods = config.periods;
    const metaPorPeriodo =
      periods > 0
        ? indicator.annualTarget / periods
        : indicator.annualTarget;

    return {
      label: config.label,
      metaPorPeriodo,
    };
  };

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 2,
        boxShadow: 1,
        border: '1px solid #e0e0e0',
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: appColors.blue }}
        >
          Indicadores creados
        </Typography>

        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            backgroundColor: '#f3f4f6',
            fontSize: 12,
            color: 'text.secondary',
          }}
        >
          {total === 1 ? '1 indicador' : `${total} indicadores`}
        </Box>
      </Box>

      {total === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Aún no has creado indicadores. Usa el botón &quot;Nuevo
          indicador&quot; para registrar el primero.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>
                  Nombre del Indicador
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fórmula</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  Meta por Período
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600 }}
                  align="center"
                >
                  Acciones
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600 }}
                  align="center"
                >
                  Gestionar
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {indicators.map((indicator) => {
                const { label, metaPorPeriodo } =
                  getPeriodInfo(indicator);
                const disabledActions = indicator.hasData === true;

                return (
                  <TableRow key={indicator.id} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {indicator.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        Frecuencia: {label} · Tendencia:{' '}
                        {indicator.trend === 'ASC'
                          ? 'Ascendente'
                          : 'Descendente'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {indicator.formula}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {formatNumber(metaPorPeriodo)}{' '}
                        {indicator.unit}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        Meta anual:{' '}
                        {formatNumber(indicator.annualTarget)}{' '}
                        {indicator.unit}
                      </Typography>
                    </TableCell>

                    {/* ACCIONES: editar / eliminar */}
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <Tooltip
                          title={
                            disabledActions
                              ? 'No se puede editar un indicador que ya tiene mediciones guardadas.'
                              : 'Editar indicador'
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => onEdit(indicator)}
                              disabled={disabledActions}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={
                            disabledActions
                              ? 'No se puede eliminar un indicador que ya tiene mediciones guardadas.'
                              : 'Eliminar indicador'
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => onDelete(indicator)}
                              disabled={disabledActions}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>

                    {/* GESTIONAR */}
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        sx={{
                          textTransform: 'none',
                          borderColor: appColors.blue,
                          color: appColors.blue,
                          '&:hover': {
                            borderColor: appColors.blue,
                            backgroundColor: '#f3f6fb',
                          },
                        }}
                        onClick={() => onManage(indicator)}
                      >
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
