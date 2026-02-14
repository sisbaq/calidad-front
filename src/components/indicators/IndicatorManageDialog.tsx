import { useEffect, useState } from 'react';
import type { ChangeEvent, FC } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
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
  Snackbar,
  Alert,
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';

import type {
  Indicator,
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


const isNonNegativeNumber = (value: unknown): boolean => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
};

const isFilled = (value: unknown): boolean => {
  return value !== null && value !== undefined && String(value).trim() !== '';
};

const canSendBySequence = (
  rows: IndicatorPeriodRow[],
  currentIndex: number,
): boolean => {
  for (let i = 0; i < currentIndex; i++) {
    if (!rows[i].sent) return false;
  }
  return true;
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

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<
    Record<number, { realValue?: string }>
  >({});

  useEffect(() => {
    if (!indicator || !open) {
      setRows([]);
      setFieldErrors({});
      return;
    }

    const { periods } = getPeriodConfig(indicator.periodicity);

    const initialRows: IndicatorPeriodRow[] = Array.from(
      { length: periods },
      (_, index) => ({
        index: index + 1,
        label: `${index + 1}`,
        meta: null,
        realValue: '',
        managementDate: '',
        possibleDate: '',
        observation: '',
        evidence: null,
        sent: false,
      }),
    );

    setRows(initialRows);
  }, [indicator, open]);


  const handleChangeObservation =
    (rowIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setRows((prev) => {
        const updated = [...prev];
        if (updated[rowIndex].sent) return prev;
        updated[rowIndex].observation = value;
        return updated;
      });
    };

  const handleChangeEvidence =
    (rowIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      setRows((prev) => {
        const updated = [...prev];
        if (updated[rowIndex].sent) return prev;
        updated[rowIndex].evidence = file;
        return updated;
      });
    };

  const isRowValidToSend = (
    row: IndicatorPeriodRow,
    rowIndex: number,
  ): boolean => {
    // Secuencia obligatoria
    if (!canSendBySequence(rows, rowIndex)) return false;

    // Errores visibles en campos
    if (fieldErrors[rowIndex]) return false;

    // Campos obligatorios diligenciados
    if (
      !isFilled(row.realValue) ||
      !isFilled(row.managementDate) ||
      !isFilled(row.observation)
    ) {
      return false;
    }
    if (
      !isNonNegativeNumber(row.realValue)
    ) {
      return false;
    }

    return true;
  };

  const handleSendRow = () => {
    if (selectedRowIndex === null) return;

    const row = rows[selectedRowIndex];

    if (!canSendBySequence(rows, selectedRowIndex)) {
      setErrorMessage(
        'Debe enviar los seguimientos de los períodos anteriores antes de continuar.',
      );
      setConfirmOpen(false);
      return;
    }

    if (!isRowValidToSend(row, selectedRowIndex)) {
      setErrorMessage(
        'Debe diligenciar todos los campos obligatorios del período antes de enviar.',
      );
      setConfirmOpen(false);
      return;
    }

    setRows((prev) => {
      const updated = [...prev];
      updated[selectedRowIndex].sent = true;
      return updated;
    });

    setConfirmOpen(false);
    setSelectedRowIndex(null);
    setSuccessOpen(true);
  };


  const periodicidadLabel =
    indicator &&
    PERIODICITY_CONFIG.find((p) => p.value === indicator.periodicity)?.label;

  const tendenciaLabel =
    indicator &&
    TREND_OPTIONS.find((t) => t.value === indicator.trend)?.label;

  return (
    <>
      <Dialog fullWidth maxWidth="xl" open={open} onClose={onClose}>
        <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>
          {indicator && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="h6">{indicator.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  <span style={{ fontWeight: 700 }}>Fórmula:</span>{' '}
                  {indicator.formula}
                </Typography>
              </Box>
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
                  <TableCell>Valor real</TableCell>
                  <TableCell>Meta</TableCell>
                  <TableCell>Tolerancia</TableCell>
                  <TableCell>Fecha de gestión</TableCell>
                  <TableCell>Observaciones</TableCell>
                  <TableCell>Evidencia</TableCell>
                  <TableCell>Acciones de control</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row, rowIndex) => {
                  const canSend = isRowValidToSend(row, rowIndex);
                  const showControlActions =
                    indicator?.tolerance !== undefined &&
                    row.meta !== null &&
                    row.meta < indicator.tolerance &&
                    rowIndex === rows.length - 1 &&
                    row.sent === true;

                  return (
                    <TableRow
                      key={row.index}
                      sx={{
                        opacity: row.sent ? 0.6 : 1,
                        backgroundColor: row.sent ? '#f5f5f5' : 'inherit',
                      }}
                    >
                      <TableCell>{row.label}</TableCell>

                      <TableCell sx={{ width: 120 }}>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          disabled={row.sent}
                          value={row.realValue}
                          error={Boolean(fieldErrors[rowIndex]?.realValue)}
                          helperText={fieldErrors[rowIndex]?.realValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            const num = Number(value);

                            setRows((prev) => {
                              const updated = [...prev];
                              updated[rowIndex].realValue = value;
                              return updated;
                            });

                            setFieldErrors((prev) => {
                              const updated = { ...prev };
                              if (num < 0) {
                                updated[rowIndex] = {
                                  ...updated[rowIndex],
                                  realValue:
                                    'El valor real no puede ser negativo',
                                };
                              } else {
                                delete updated[rowIndex]?.realValue;
                                if (
                                  updated[rowIndex] &&
                                  Object.keys(updated[rowIndex]).length === 0
                                ) {
                                  delete updated[rowIndex];
                                }
                              }
                              return updated;
                            });
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        {row.meta !== null ? (
                          <>
                            {formatNumber(row.meta)} {indicator?.unit}
                          </>
                        ) : (
                          '-'
                        )}
                      </TableCell>

                      <TableCell>
                        {indicator?.tolerance !== undefined
                          ? `${formatNumber(indicator.tolerance)}%`
                          : '-'}
                      </TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          type="date"
                          fullWidth
                          disabled={row.sent}
                          value={row.managementDate}
                          onChange={(e) => {
                            const value = e.target.value;

                            setRows((prev) => {
                              const updated = [...prev];
                              updated[rowIndex].managementDate = value;
                              return updated;
                            });
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ width: '30%' }}>
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
                        {showControlActions ? (
                          <Link
                            href="#"
                            underline="always"
                            onClick={(event) => event.preventDefault()}
                          >
                            Acciones de control
                          </Link>
                        ) : (
                          '-'
                        )}
                      </TableCell>

                      <TableCell>
                        <Tooltip
                          title={
                            row.sent
                              ? 'Registro ya enviado'
                              : !canSendBySequence(rows, rowIndex)
                                ? 'Debe diligenciar el período anterior'
                                : !canSend
                                  ? 'Debe completar los campos correctamente'
                                  : 'Enviar seguimiento'
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
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar envío</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea enviar este seguimiento? Una vez enviado no
            podrá editarlo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSendRow}>
            Enviar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
      >
        <Alert severity="success">
          Seguimiento enviado con éxito
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={4000}
        onClose={() => setErrorMessage(null)}
      >
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </>
  );
};
