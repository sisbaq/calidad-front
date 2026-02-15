import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import type { AutoControlRecord } from '@/types/autocontrol';
import { appColors } from '@/theme/colors';

interface AutoControlRecordsTableProps {
  records: AutoControlRecord[];
  isIndicadoresSelected: boolean;
  tipoById: Map<number, string>;
  processById: Map<number, string>;
  origenById: Map<number, string>;
  estadoPlanById: Map<number, string>;
  onCreatePlan: (findingId: number) => void;
  onManagePlan: (findingId: number) => void;
  onViewPlan: (findingId: number) => void;
}

export default function AutoControlRecordsTable({
  records,
  isIndicadoresSelected,
  tipoById,
  processById,
  origenById,
  estadoPlanById,
  onCreatePlan,
  onManagePlan,
  onViewPlan,
}: AutoControlRecordsTableProps) {
  return (
    <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {isIndicadoresSelected ? (
              <>
                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              </>
            ) : (
              <>
                <TableCell sx={{ fontWeight: 700 }}>Hallazgo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Proceso</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Origen</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado plan</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha proyectada</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actividades</TableCell>
              </>
            )}
            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isIndicadoresSelected ? 5 : 8} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                  No hay registros de autocontrol para este tipo.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.finding.hacId} hover>
                {isIndicadoresSelected ? (
                  <>
                    <TableCell>
                      {record.finding.hacCreado
                        ? new Date(record.finding.hacCreado).toLocaleDateString('es-CO')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {record.finding.hacDescripcion}
                      </Typography>
                    </TableCell>
                    <TableCell>{tipoById.get(record.finding.fkTipoAutocontrol) ?? '-'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={estadoPlanById.get(record.plan.fkEstadoPlanAuto) ?? '-'}
                        sx={{
                          backgroundColor: appColors.green,
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        #{record.finding.hacId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {record.finding.hacDescripcion}
                      </Typography>
                    </TableCell>
                    <TableCell>{processById.get(record.finding.fkProceso) ?? '-'}</TableCell>
                    <TableCell>{tipoById.get(record.finding.fkTipoAutocontrol) ?? '-'}</TableCell>
                    <TableCell>{origenById.get(record.finding.fkOrigen) ?? '-'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={estadoPlanById.get(record.plan.fkEstadoPlanAuto) ?? '-'}
                        sx={{
                          backgroundColor: appColors.green,
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>{record.plan.pmaFechaProyectada || '-'}</TableCell>
                    <TableCell>{record.activities.length}</TableCell>
                  </>
                )}
                <TableCell align="center">
                  <Tooltip title="Crear plan">
                    <IconButton onClick={() => onCreatePlan(record.finding.hacId)} sx={{ color: appColors.green }}>
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Gestionar plan">
                    <IconButton onClick={() => onManagePlan(record.finding.hacId)} sx={{ color: appColors.blue }}>
                      <SettingsSuggestOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ver actividades">
                    <IconButton onClick={() => onViewPlan(record.finding.hacId)} sx={{ color: appColors.blue }}>
                      <VisibilityOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
