import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Paper } from '@mui/material';
import { formatNumber, PERIODICITY_CONFIG } from '../../types/indicators';
import type { Indicator } from '../../types/indicators';

interface Props {
  open: boolean;
  indicator?: Indicator | null;
  onClose: () => void;
}

export const IndicatorViewModal: React.FC<Props> = ({ open, indicator, onClose }) => {
  if (!indicator) return null;

  const periodsCount = (() => {
    switch (indicator.periodicity) {
      case 'MENSUAL': return 12;
      case 'BIMESTRAL': return 6;
      case 'TRIMESTRAL': return 4;
      case 'CUATRIMESTRAL': return 3;
      case 'SEMESTRAL': return 2;
      case 'ANUAL': return 1;
      default: return 12;
    }
  })();

  const periodRows = new Array(periodsCount).fill(null).map((_, i) => {
       let label = '';
    switch (indicator.periodicity) {
      case 'MENSUAL':
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        label = meses[i];
        break;
      case 'BIMESTRAL':
        label = `Bimestre ${i + 1}`;
        break;
      case 'TRIMESTRAL':
        label = `Trimestre ${i + 1}`;
        break;
      case 'CUATRIMESTRAL':
        label = `Cuatrimestre ${i + 1}`;
        break;
      case 'SEMESTRAL':
        label = `Semestre ${i + 1}`;
        break;
      case 'ANUAL':
        label = 'Anual';
        break;
      default:
        label = `Período ${i + 1}`;
    }
    
    return {
      id: String(i),
      label,
    };
  });

  const periodicityConfig = PERIODICITY_CONFIG.find(p => p.value === indicator.periodicity);
  const metaPerPeriod = periodicityConfig ? indicator.annualTarget / periodicityConfig.periods : indicator.annualTarget;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid #eee', backgroundColor: '#f7f9fc' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {indicator.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Frecuencia: {periodicityConfig?.label} · Tendencia: {indicator.trend === 'ASC' ? 'Ascendente' : 'Descendente'}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 2.5 }}>
        <Box sx={{ 
          mb: 2.5, 
          p: 2, 
          borderRadius: 1.5, 
          backgroundColor: '#e8f1ff',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5
        }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Fórmula:{' '}
              <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace' }}>
                {indicator.formula}
              </Typography>
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Meta Anual: <strong>{formatNumber(indicator.annualTarget)} {indicator.unit}</strong>
            </Typography>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          boxShadow: 'none'
        }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Período</TableCell>
                {indicator.variables.map(v => (
                  <TableCell key={v.id} sx={{ fontWeight: 600 }}>{v.key}</TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600 }}>Resultado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Meta</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cumplimiento</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 260 }}>Observaciones de medición</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>Anexo / Evidencia</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {periodRows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.label}</TableCell>
                  {indicator.variables.map(v => (
                    <TableCell key={v.id}>
                      <TextField 
                        fullWidth 
                        size="small" 
                        disabled 
                        placeholder="-"
                        sx={{
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: '#666',
                            backgroundColor: '#f5f5f5'
                          }
                        }}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatNumber(metaPerPeriod)} {indicator.unit}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  </TableCell>
                  <TableCell>
                    <TextField 
                      fullWidth 
                      multiline 
                      rows={3} 
                      disabled 
                      placeholder="Observaciones..."
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#666',
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField 
                      fullWidth 
                      disabled 
                      placeholder="URL, código o referencia"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#666',
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ textTransform: 'none' }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};