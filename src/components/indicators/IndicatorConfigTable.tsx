import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  Chip,
  Typography,
  Box,
} from '@mui/material';

import type { Indicator } from '@/types/indicators';

interface Props {
  indicators: Indicator[];
  onToggle: (id: string, active: boolean) => void;
}

export const IndicatorConfigTable = ({
  indicators,
  onToggle,
}: Props) => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Activo</TableCell>
          <TableCell>Indicador</TableCell>
          <TableCell>Frecuencia</TableCell>
          <TableCell>Estado</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {indicators.map((i) => (
          <TableRow key={i.id} hover>
            <TableCell>
              <Switch
                checked={Boolean(i.active)}
                onChange={(e) => onToggle(i.id, e.target.checked)}
              />
            </TableCell>

            <TableCell>
              <Typography variant="body2" fontWeight={500}>
                {i.name}
              </Typography>
            </TableCell>

            <TableCell>{i.periodicity}</TableCell>

            <TableCell>
              <Chip
                size="small"
                label={i.active ? 'Activo' : 'Inactivo'}
                color={i.active ? 'success' : 'default'}
              />
            </TableCell>
          </TableRow>
        ))}

        {indicators.length === 0 && (
          <TableRow>
            <TableCell colSpan={4}>
              <Box py={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  No hay indicadores para este proceso
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
