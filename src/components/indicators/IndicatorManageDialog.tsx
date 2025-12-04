import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FC } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { evaluate } from 'mathjs';
import { appColors } from '@/theme/colors';

import type {
  Indicator,
  IndicatorVariable,
  PeriodRow,
} from '../../types/indicators';
import {
  PERIODICITY_CONFIG,
  TREND_OPTIONS,
  formatNumber,
  getPeriodConfig,
  getPeriodLabel,
} from '../../types/indicators';

interface IndicatorManageDialogProps {
  open: boolean;
  indicator: Indicator | null;
  onClose: () => void;
  onSave?: (rows: PeriodRow[]) => void;
}

interface PreparedFormula {
  expression: string;
  symbolMap: Record<string, string>;
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const prepareFormula = (
  formula: string,
  variables: IndicatorVariable[] | undefined,
): PreparedFormula => {
  let expression = formula;
  const symbolMap: Record<string, string> = {};

  (variables ?? []).forEach((v, index) => {
    const displayName = v.key.trim();
    if (!displayName) return;

    const symbol = `v${index + 1}`;
    symbolMap[displayName] = symbol;

    const escaped = escapeRegExp(displayName);
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    expression = expression.replace(regex, symbol);
  });

  return { expression, symbolMap };
};

export const IndicatorManageDialog: FC<IndicatorManageDialogProps> = ({
  open,
  indicator,
  onClose,
  onSave,
}) => {
  const [rows, setRows] = useState<PeriodRow[]>([]);

  const preparedFormula = useMemo<PreparedFormula | null>(() => {
    if (!indicator) return null;
    return prepareFormula(indicator.formula, indicator.variables);
  }, [indicator]);

  useEffect(() => {
    if (!indicator || !open) {
      setRows([]);
      return;
    }

    const { periods } = getPeriodConfig(indicator.periodicity);
    const metaPerPeriod =
      periods > 0 ? indicator.annualTarget / periods : indicator.annualTarget;

    const vars = indicator.variables ?? [];

    const initialRows: PeriodRow[] = Array.from(
      { length: periods },
      (_, index) => {
        const values: Record<string, string> = {};
        vars.forEach((v) => {
          values[v.key] = '';
        });

        return {
          index: index + 1,
          label: getPeriodLabel(indicator.periodicity, index),
          meta: metaPerPeriod,
          values,
          result: undefined,
          observation: '',
          evidence: '',
        };
      },
    );

    setRows(initialRows);
  }, [indicator, open]);

  const handleChangeValue =
    (rowIndex: number, variableKey: string) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;

        setRows((prev) => {
          if (!indicator || !preparedFormula) return prev;

          const updated = [...prev];
          const currentRow = updated[rowIndex];

          const newValues = {
            ...currentRow.values,
            [variableKey]: newValue,
          };

          const scope: Record<string, number> = {};
          const vars = indicator.variables ?? [];

          vars.forEach((v) => {
            const displayName = v.key.trim();
            const safeSymbol = preparedFormula.symbolMap[displayName];
            if (!safeSymbol) return;

            const rawVal = newValues[displayName];
            const numeric = Number(rawVal);
            scope[safeSymbol] = Number.isFinite(numeric) ? numeric : 0;
          });

          let result: number | undefined;
          try {
            const evaluated = evaluate(
              preparedFormula.expression,
              scope,
            ) as unknown;
            if (typeof evaluated === 'number' && Number.isFinite(evaluated)) {
              result = evaluated;
            }
          } catch {
            result = undefined;
          }

          updated[rowIndex] = {
            ...currentRow,
            values: newValues,
            result,
          };

          return updated;
        });
      };

  const handleChangeObservation =
    (rowIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex] = {
          ...updated[rowIndex],
          observation: value,
        };
        return updated;
      });
    };

  const handleChangeEvidence =
    (rowIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex] = {
          ...updated[rowIndex],
          evidence: value,
        };
        return updated;
      });
    };

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    if (onSave) {
      onSave(rows);
    }
    onClose();
  };

  const periodicidadLabel =
    indicator &&
    PERIODICITY_CONFIG.find((p) => p.value === indicator.periodicity)?.label;
  const tendenciaLabel =
    indicator &&
    TREND_OPTIONS.find((t) => t.value === indicator.trend)?.label;

  return (
    <Dialog
      fullWidth
      maxWidth="xl"
      open={open}
      onClose={handleClose}
      scroll="paper"
      sx={{
        '& .MuiDialog-paper': {
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: '1px solid #eee',
          backgroundColor: '#f7f9fc',
        }}
      >
        {indicator && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {indicator.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Frecuencia: {periodicidadLabel} · Tendencia: {tendenciaLabel}
            </Typography>
          </>
        )}
      </DialogTitle>
      <DialogContent sx={{ p: 2.5 }}>
        {indicator && (
          <>
            <Box
              sx={{
                mb: 2.5,
                p: 2,
                borderRadius: 1.5,
                backgroundColor: '#e8f1ff',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <InfoOutlinedIcon
                sx={{ color: appColors.blue, mt: '2px' }}
                fontSize="small"
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Fórmula:{' '}
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {indicator.formula}
                  </Typography>
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Meta Anual:{' '}
                  <strong>
                    {formatNumber(indicator.annualTarget)} {indicator.unit}
                  </strong>
                </Typography>
              </Box>
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                boxShadow: 'none',
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>
                      Período
                    </TableCell>
                    {(indicator.variables ?? []).map((v) => (
                      <TableCell key={v.key} sx={{ fontWeight: 600 }}>
                        {v.key}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 600 }}>Resultado</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Meta</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Cumplimiento
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 260 }}>
                      Observaciones de medición
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>
                      Anexo / Evidencia
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, rowIndex) => {
                    const hasResult =
                      typeof row.result === 'number' &&
                      Number.isFinite(row.result);

                    let compliance: number | undefined;

                    if (
                      hasResult &&
                      typeof row.result === 'number' &&
                      row.meta > 0
                    ) {
                      compliance = (row.result / row.meta) * 100;
                    }

                    return (
                      <TableRow key={row.index} hover>
                        <TableCell>{row.label}</TableCell>
                        {(indicator.variables ?? []).map((v) => (
                          <TableCell key={v.key}>
                            <TextField
                              size="small"
                              fullWidth
                              type="number"
                              value={row.values[v.key] ?? ''}
                              onChange={handleChangeValue(rowIndex, v.key)}
                              inputProps={{ step: '0.01' }}
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <Typography variant="body2">
                            {hasResult && typeof row.result === 'number'
                              ? `${formatNumber(row.result)} ${indicator.unit}`
                              : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatNumber(row.meta)} {indicator.unit}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                compliance !== undefined && compliance >= 100
                                  ? appColors.green
                                  : 'text.primary',
                              fontWeight: compliance ? 600 : 400,
                            }}
                          >
                            {compliance !== undefined
                              ? `${formatNumber(compliance, 0)}%`
                              : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            multiline
                            minRows={3}
                            maxRows={6}
                            value={row.observation}
                            onChange={handleChangeObservation(rowIndex)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="URL, código o referencia"
                            value={row.evidence}
                            onChange={handleChangeEvidence(rowIndex)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2.5 }}>
        <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
          Cerrar
        </Button>
        <Button
          variant="contained"
          sx={{
            textTransform: 'none',
            backgroundColor: appColors.blue,
            '&:hover': {
              backgroundColor: appColors.blue,
              opacity: 0.9,
            },
          }}
          onClick={handleSave}
        >
          Guardar cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};
