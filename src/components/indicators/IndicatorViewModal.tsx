import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';

import { formatNumber, PERIODICITY_CONFIG } from '../../types/indicators';
import type { Indicator } from '../../types/indicators';

interface Props {
  open: boolean;
  indicator?: Indicator | null;
  onClose: () => void;
}

interface PeriodRowData {
  realValue: string;
  managementDate: string;
  observations: string;
  evidence: File | null;
}

export const IndicatorViewModal: React.FC<Props> = ({
  open,
  indicator,
  onClose
}) => {
  /* =========================
     Hooks (siempre arriba)
  ========================= */

  const [rowsData, setRowsData] = useState<Record<string, PeriodRowData>>({});
  const [saveOpen, setSaveOpen] = useState(false);

  /* =========================
     Configuración de periodicidad
  ========================= */

  const periodicityConfig = indicator
    ? PERIODICITY_CONFIG.find(p => p.value === indicator.periodicity)
    : null;

  const periodsCount = periodicityConfig?.periods ?? 0;

  /* =========================
     Inicialización de filas
  ========================= */

  useEffect(() => {
    if (!indicator || periodsCount === 0) return;

    const initial: Record<string, PeriodRowData> = {};

    for (let i = 0; i < periodsCount; i++) {
      initial[String(i)] = {
        realValue: '',
        managementDate: '',
        observations: '',
        evidence: null
      };
    }

    setRowsData(initial);
  }, [indicator, periodsCount]);

  /* =========================
     Guard clause
  ========================= */

  if (!indicator) return null;

  /* =========================
     Handlers
  ========================= */

  const handleRealValueChange = (
    rowId: string,
    value: string
  ) => {
    setRowsData(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        realValue: value
      }
    }));
  };

  const handleManagementDateChange = (
    rowId: string,
    value: string
  ) => {
    setRowsData(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        managementDate: value
      }
    }));
  };

  const handleObservationChange = (
    rowId: string,
    value: string
  ) => {
    setRowsData(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        observations: value
      }
    }));
  };

  const handleEvidenceChange = (rowId: string, file: File | null) => {
    setRowsData(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        evidence: file
      }
    }));
  };

  /* =========================
     Render
  ========================= */

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Typography fontWeight={600}>{indicator.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Frecuencia: {periodicityConfig?.label}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Período</TableCell>
                  <TableCell>Valor real</TableCell>
                  <TableCell>Meta</TableCell>
                  <TableCell>Tolerancia</TableCell>
                  <TableCell>Fecha de gestión</TableCell>
                  <TableCell>Observaciones</TableCell>
                  <TableCell>Anexo</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {Object.entries(rowsData).map(([rowId, row]) => {
                  return (
                    <TableRow key={rowId}>
                      <TableCell>{Number(rowId) + 1}</TableCell>

                      <TableCell sx={{ width: 120 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={row.realValue}
                          onChange={e =>
                            handleRealValueChange(rowId, e.target.value)
                          }
                        />
                      </TableCell>

                      <TableCell>-</TableCell>
                      <TableCell>
                        {indicator.tolerance !== undefined
                          ? `${formatNumber(indicator.tolerance)}%`
                          : '-'}
                      </TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          type="date"
                          fullWidth
                          value={row.managementDate}
                          onChange={e =>
                            handleManagementDateChange(rowId, e.target.value)
                          }
                        />
                      </TableCell>

                      <TableCell sx={{ width: '30%' }}>
                        <TextField
                          size="small"
                          value={row.observations}
                          onChange={e =>
                            handleObservationChange(
                              rowId,
                              e.target.value
                            )
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Button
                          component="label"
                          size="small"
                        >
                          {row.evidence ? 'Cambiar archivo' : 'Subir archivo'}
                          <input
                            type="file"
                            hidden
                            onChange={e =>
                              handleEvidenceChange(
                                rowId,
                                e.target.files?.[0] ?? null
                              )
                            }
                          />
                        </Button>
                      </TableCell>

                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" onClick={() => setSaveOpen(true)}>
            Guardar cambios
          </Button>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={saveOpen}
        autoHideDuration={3000}
        onClose={() => setSaveOpen(false)}
      >
        <Alert severity="success" onClose={() => setSaveOpen(false)}>
          Cambios guardados
        </Alert>
      </Snackbar>
    </>
  );
};
