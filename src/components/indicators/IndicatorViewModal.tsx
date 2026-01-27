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
  Stack
} from '@mui/material';

import { formatNumber, PERIODICITY_CONFIG } from '../../types/indicators';
import type { Indicator } from '../../types/indicators';

interface Props {
  open: boolean;
  indicator?: Indicator | null;
  onClose: () => void;
}

interface PeriodRowData {
  variables: Record<string, number>;
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
  const [editingRow, setEditingRow] = useState<string | null>(null);

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
        variables: indicator.variables.reduce((acc, v) => {
          acc[v.id] = 0;
          return acc;
        }, {} as Record<string, number>),
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

  const metaPerPeriod =
    indicator.annualTarget / (periodicityConfig?.periods ?? 1);

  /* =========================
     Handlers
  ========================= */

  const handleVariableChange = (
    rowId: string,
    variableId: string,
    value: string
  ) => {
    const num = Number(value);

    setRowsData(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        variables: {
          ...prev[rowId].variables,
          [variableId]: Number.isNaN(num) ? 0 : num
        }
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
     Cálculos
  ========================= */

  const calculateResult = (row: PeriodRowData): number =>
    Object.values(row.variables).reduce((sum, val) => sum + val, 0);

  const calculateCompliance = (result: number): number =>
    metaPerPeriod > 0 ? (result / metaPerPeriod) * 100 : 0;

  /* =========================
     Render
  ========================= */

  return (
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
                {indicator.variables.map(v => (
                  <TableCell key={v.id}>{v.key}</TableCell>
                ))}
                <TableCell>Resultado</TableCell>
                <TableCell>Meta</TableCell>
                <TableCell>Cumplimiento</TableCell>
                <TableCell>Observaciones</TableCell>
                <TableCell>Anexo</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {Object.entries(rowsData).map(([rowId, row]) => {
                const result = calculateResult(row);
                const compliance = calculateCompliance(result);

                return (
                  <TableRow key={rowId}>
                    <TableCell>{Number(rowId) + 1}</TableCell>

                    {indicator.variables.map(v => (
                      <TableCell key={v.id}>
                        <TextField
                          size="small"
                          type="number"
                          disabled={editingRow !== rowId}
                          value={row.variables[v.id]}
                          onChange={e =>
                            handleVariableChange(
                              rowId,
                              v.id,
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                    ))}

                    <TableCell>{formatNumber(result)}</TableCell>
                    <TableCell>{formatNumber(metaPerPeriod)}</TableCell>
                    <TableCell>{formatNumber(compliance)}%</TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        disabled={editingRow !== rowId}
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
                        disabled={editingRow !== rowId}
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

                    <TableCell>
                      {editingRow === rowId ? (
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => setEditingRow(null)}
                          >
                            Guardar
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setEditingRow(null)}
                          >
                            Cancelar
                          </Button>
                        </Stack>
                      ) : (
                        <Button
                          size="small"
                          onClick={() => setEditingRow(rowId)}
                        >
                          Editar
                        </Button>
                      )}
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
  );
};
