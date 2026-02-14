import React, { useMemo, useState } from 'react';
import {
    Box,
    Button,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    FormControl,
    InputLabel,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { appColors } from '@/theme/colors';
import type { Indicator } from '../../types/indicators';
import type { ProcessOption } from '../../types/audit';
import { PERIODICITY_CONFIG } from '../../types/indicators';

interface Props {
    indicators: Indicator[];
    role: 'ADMIN' | 'GESTOR';
    processes?: ProcessOption[];
    onManage: (indicator: Indicator) => void;
    onView: (indicator: Indicator) => void;
    onEdit: (indicator: Indicator) => void;
    onDelete: (indicator: Indicator) => void;
}

export const IndicatorTable: React.FC<Props> = ({ indicators, role, processes = [], onManage, onView, onEdit, onDelete }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [filterProcess, setFilterProcess] = useState<string>('ALL');
    const [textSearch, setTextSearch] = useState<string>('');

    // Use processes from props if available, otherwise fallback to extracting from indicators
    const processOptions = useMemo(() => {
        if (processes.length > 0) {
            return processes;
        }
        // Fallback: extract unique processes from indicators
        const set = new Set<string>();
        indicators.forEach((i) => { if (i.process) set.add(i.process); });
        return Array.from(set).sort().map((name, index) => ({ id: index, name }));
    }, [indicators, processes]);

    const filtered = useMemo(() => {
        return indicators.filter((ind) => {
            if (textSearch.trim()) {
                const q = textSearch.trim().toLowerCase();
                if (!(ind.name.toLowerCase().includes(q) || (ind.responsible || '').toLowerCase().includes(q) || ind.formula.toLowerCase().includes(q))) {
                    return false;
                }
            }

            if (role === 'ADMIN' && filterProcess !== 'ALL') {
                if ((ind.process ?? '') !== filterProcess) return false;
            }

            return true;
        });
    }, [indicators, role, filterProcess, textSearch]);

    const visibleRows = useMemo(() => {
        const start = page * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, page, rowsPerPage]);

    const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 1, border: '1px solid #e0e0e0' }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: appColors.blue, mb: 2 }}>
                    Indicadores creados
                </Typography>

                {role === 'ADMIN' && (
                    <Box sx={{
                        mb: 2,
                        p: 2,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 1,
                        border: '1px solid #e0e0e0'
                    }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#333' }}>
                            Filtros
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Proceso</InputLabel>
                                <Select
                                    value={filterProcess}
                                    label="Proceso"
                                    onChange={(e) => { setFilterProcess(e.target.value); setPage(0); }}
                                    sx={{ backgroundColor: 'white' }}
                                >
                                    <MenuItem value="ALL">Todos los procesos</MenuItem>
                                    {processOptions.map((p) => <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>)}
                                </Select>
                            </FormControl>

                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                    setFilterProcess('ALL');
                                    setTextSearch('');
                                    setPage(0);
                                }}
                                sx={{
                                    textTransform: 'none',
                                    minWidth: 100,
                                    borderColor: '#d0d0d0',
                                    color: '#666'
                                }}
                            >
                                Limpiar
                            </Button>
                        </Stack>
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <TextField
                        size="small"
                        placeholder="Buscar..."
                        value={textSearch}
                        onChange={(e) => { setTextSearch(e.target.value); setPage(0); }}
                        sx={{ minWidth: 250 }}
                    />
                </Box>
            </Box>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Nombre del Indicador</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Tendencia</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Unidad</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Responsable</TableCell>
                            {role === 'ADMIN' && <TableCell sx={{ fontWeight: 600 }}>Proceso</TableCell>}
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>{role === 'ADMIN' ? 'Ver' : 'Gestionar'}</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {visibleRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={role === 'ADMIN' ? 8 : 7} align="center">
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                        No se encontraron indicadores
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibleRows.map((indicator) => {
                                const hasSentTracking = indicator.periods?.some(
                                    (p) => p.sent === true
                                );
                                return (
                                    <TableRow key={indicator.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{indicator.name}</Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                {PERIODICITY_CONFIG.find(p => p.value === indicator.periodicity)?.label} · Fórmula: <span style={{ fontFamily: 'monospace' }}>{indicator.formula}</span>
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {indicator.active ? 'Activo' : 'Inactivo'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell><Typography variant="body2">{indicator.trend === 'ASC' ? 'Ascendente' : 'Descendente'}</Typography></TableCell>
                                        <TableCell><Typography variant="body2">{indicator.unit}</Typography></TableCell>
                                        <TableCell><Typography variant="body2">{indicator.responsible ?? '-'}</Typography></TableCell>

                                        {role === 'ADMIN' && <TableCell><Typography variant="body2">{indicator.process ?? '-'}</Typography></TableCell>}

                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">

                                                <Tooltip
                                                    title={
                                                        hasSentTracking
                                                            ? 'Este indicador tiene seguimientos enviados y no puede editarse'
                                                            : 'Editar indicador'
                                                    }
                                                >
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            disabled={hasSentTracking}
                                                            onClick={() => onEdit(indicator)}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip
                                                    title={
                                                        hasSentTracking
                                                            ? 'No se puede eliminar un indicador con seguimientos enviados'
                                                            : 'Eliminar indicador'
                                                    }
                                                >
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            disabled={hasSentTracking}
                                                            onClick={() => onDelete(indicator)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>

                                        <TableCell align="center">
                                            {role === 'ADMIN' ? (
                                                <Button variant="outlined" size="small" startIcon={<VisibilityIcon />} sx={{ textTransform: 'none', borderColor: appColors.blue, color: appColors.blue }} onClick={() => onView(indicator)}>
                                                    Ver
                                                </Button>
                                            ) : (
                                                <Tooltip
                                                    title={
                                                        hasSentTracking
                                                            ? 'Este indicador ya tiene seguimientos enviados'
                                                            : 'Gestionar indicador'
                                                    }
                                                >
                                                    <span>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<VisibilityIcon />}
                                                            disabled={hasSentTracking}
                                                            sx={{
                                                                textTransform: 'none',
                                                                borderColor: appColors.blue,
                                                                color: appColors.blue,
                                                            }}
                                                            onClick={() => onManage(indicator)}
                                                        >
                                                            Gestionar
                                                        </Button>
                                                    </span>
                                                </Tooltip>

                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 20]}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
        </Paper>
    );
};
