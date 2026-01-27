import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Select,
  MenuItem,
  Button,
} from '@mui/material';

import { IndicatorConfigTable } from '@/components/indicators/IndicatorConfigTable';
import type { Indicator } from '@/types/indicators';

const MOCK_PROCESSES = [
  { id: 'proc-1', name: 'Planeación Estratégica' },
  { id: 'proc-2', name: 'Gestión Ambiental' },
];

const MOCK_INDICATORS: Indicator[] = [
  {
    id: '1',
    name: 'Indicador 1',
    periodicity: 'MENSUAL',
    unit: '%',
    annualTarget: 100,
    trend: 'ASC',
    formula: 'A/B',
    realValue: 0,
    variables: [],
    active: true,
    processId: 'proc-1',
  },
  {
    id: '2',
    name: 'Indicador 2',
    periodicity: 'TRIMESTRAL',
    unit: 'Número',
    annualTarget: 50,
    trend: 'DESC',
    formula: 'X-Y',
    realValue: 0,
    variables: [],
    active: false,
    processId: 'proc-1',
  },
];

export const IndicatorConfigurationPage = () => {
  const [selectedProcess, setSelectedProcess] = useState<string>('proc-1');
  const [indicators, setIndicators] = useState<Indicator[]>(MOCK_INDICATORS);

  const filteredIndicators = useMemo(
    () => indicators.filter(i => i.processId === selectedProcess),
    [indicators, selectedProcess],
  );

  const handleToggleAll = (active: boolean) => {
    setIndicators(prev =>
      prev.map(i =>
        i.processId === selectedProcess ? { ...i, active } : i,
      ),
    );
  };

  const handleToggleOne = (id: string, active: boolean) => {
    setIndicators(prev =>
      prev.map(i => (i.id === id ? { ...i, active } : i)),
    );
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Configuración de Indicadores
      </Typography>

      <Card>
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ md: 'center' }}
            mb={2}
          >
            <Stack direction="row" spacing={2}>
              <Select
                size="small"
                value={selectedProcess}
                onChange={(e) => setSelectedProcess(e.target.value)}
              >
                {MOCK_PROCESSES.map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={() => handleToggleAll(true)}
              >
                Activar todos
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleToggleAll(false)}
              >
                Desactivar todos
              </Button>
            </Stack>
          </Stack>

          <IndicatorConfigTable
            indicators={filteredIndicators}
            onToggle={handleToggleOne}
          />
        </CardContent>
      </Card>
    </Box>
  );
};
