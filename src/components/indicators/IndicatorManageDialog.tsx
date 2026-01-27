import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FC } from 'react';

import {
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
  Tooltip,
  Paper,
  IconButton,
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';
import { evaluate } from 'mathjs';

import type {
  Indicator,
  IndicatorVariable,
  IndicatorPeriodRow,
} from '../../types/indicators';

import {
  PERIODICITY_CONFIG,
  TREND_OPTIONS,
  formatNumber,
  getPeriodConfig,
} from '../../types/indicators';

interface IndicatorManageDialogProps {
  open: boolean;
  indicator: Indicator | null;
  onClose: () => void;
  onSave?: (rows: IndicatorPeriodRow[]) => void;
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
  const [rows, setRows] = useState<IndicatorPeriodRow[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

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

    const initialRows: IndicatorPeriodRow[] = Array.from(
      { length: periods },
      (_, index) => {
        const values: Record<string, string> = {};
        vars.forEach((v) => {
          values[v.key] = '';
        });

        return {
          index: index + 1,
          label: `${index + 1}`,
          meta: metaPerPeriod,
          values,
          result: undefined,
          observation: '',
          evidence: null,
          sent: false,
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
          if (currentRow.sent) return prev;

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
        if (updated[rowIndex].sent) return prev;
        updated[rowIndex] = {
          ...updated[rowIndex],
          observation: value,
        };
        return updated;
      });
    };

  const handleChangeEvidence =
    (rowIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;

      setRows((prev) => {
        const updated = [...prev];
        if (updated[rowIndex].sent) return prev;
        updated[rowIndex] = {
          ...updated[rowIndex],
          evidence: file,
        };
        return updated;
      });
    };

  const handleSendRow = () => {
    if (selectedRowIndex === null) return;

    setRows((prev) => {
      const updated = [...prev];
      updated[selectedRowIndex] = {
        ...updated[selectedRowIndex],
        sent: true,
      };
      return updated;
    });

    setConfirmOpen(false);
    setSelectedRowIndex(null);
  };

  const handleSave = () => {
    onSave?.(rows);
    onClose();
  };

  const isRowValidToSend = (row: IndicatorPeriodRow): boolean => {
    const variablesFilled = Object.values(row.values).every(
      (v) => v !== '' && v !== null && v !== undefined,
    );

    const hasValidResult =
      typeof row.result === 'number' && Number.isFinite(row.result);

    const hasObservation =
      row.observation.trim().length > 0;

    return variablesFilled && hasValidResult && hasObservation;
  };


  const periodicidadLabel =
    indicator &&
    PERIODICITY_CONFIG.find((p) => p.value === indicator.periodicity)?.label;

  const tendenciaLabel =
    indicator &&
    TREND_OPTIONS.find((t) => t.value === indicator.trend)?.label;

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="xl"
        open={open}
        onClose={onClose}
        scroll="paper"
      >
        <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>
          {indicator && (
            <>
              <Typography variant="h6">{indicator.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Frecuencia: {periodicidadLabel} · Tendencia: {tendenciaLabel}
              </Typography>
            </>
          )}
        </DialogTitle>

        <DialogContent>
          <TableContainer component={Paper}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Período</TableCell>
                  {(indicator?.variables ?? []).map((v) => (
                    <TableCell key={v.key}>{v.key}</TableCell>
                  ))}
                  <TableCell>Resultado</TableCell>
                  <TableCell>Meta</TableCell>
                  <TableCell>Cumplimiento</TableCell>
                  <TableCell>Observaciones</TableCell>
                  <TableCell>Evidencia</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row, rowIndex) => {
                  const compliance =
                    row.result && row.meta > 0
                      ? (row.result / row.meta) * 100
                      : undefined;

                  const canSend = isRowValidToSend(row);

                  return (
                    <TableRow
                      key={row.index}
                      sx={{
                        opacity: row.sent ? 0.6 : 1,
                        backgroundColor: row.sent ? '#f5f5f5' : 'inherit',
                      }}
                    >
                      <TableCell>{row.label}</TableCell>

                      {(indicator?.variables ?? []).map((v) => (
                        <TableCell key={v.key}>
                          <TextField
                            size="small"
                            type="number"
                            fullWidth
                            disabled={row.sent}
                            value={row.values[v.key] ?? ''}
                            onChange={handleChangeValue(rowIndex, v.key)}
                          />
                        </TableCell>
                      ))}

                      <TableCell>
                        {row.result
                          ? `${formatNumber(row.result)} ${indicator?.unit}`
                          : '-'}
                      </TableCell>

                      <TableCell>
                        {formatNumber(row.meta)} {indicator?.unit}
                      </TableCell>

                      <TableCell>
                        {compliance !== undefined
                          ? `${formatNumber(compliance.toFixed(0))}%`
                          : '-'}
                      </TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          multiline
                          minRows={2}
                          fullWidth
                          disabled={row.sent}
                          value={row.observation}
                          onChange={handleChangeObservation(rowIndex)}
                        />
                      </TableCell>

                      <TableCell>
                        <Button
                          component="label"
                          size="small"
                          disabled={row.sent || Boolean(row.evidence)}
                        >
                          Subir
                          <input
                            hidden
                            type="file"
                            onChange={handleChangeEvidence(rowIndex)}
                          />
                        </Button>
                        {row.evidence && (
                          <Typography variant="caption" display="block">
                            📎 {row.evidence.name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>

                        <Tooltip
                          title={
                            row.sent
                              ? 'Registro ya enviado'
                              : !canSend
                                ? 'Debe completar todos los campos obligatorios antes de enviar'
                                : 'Enviar registro'
                          }
                        >
                          <span>
                            <IconButton
                              disabled={row.sent || !canSend}
                              onClick={() => {
                                setSelectedRowIndex(rowIndex);
                                setConfirmOpen(true);
                              }}
                            >
                              <SendIcon />
                            </IconButton>
                          </span>
                        </Tooltip>

                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Send Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar envío</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea enviar este registro? Una vez enviado no podrá
            editarlo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSendRow}>
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
