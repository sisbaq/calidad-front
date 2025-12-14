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
import { PERIODICITY_CONFIG } from '../../types/indicators';

interface Props {
    indicators: Indicator[];
    role: 'ADMIN' | 'GESTOR';
    onManage: (indicator: Indicator) => void;
    onView: (indicator: Indicator) => void;
    onEdit: (indicator: Indicator) => void;
    onDelete: (indicator: Indicator) => void;
}

const getStateFromDates = (lastUpdate: string | undefined, periodicity: Indicator['periodicity']) => {
    const now = new Date();
    const addMonths = (p: string) => {
        switch (p) {
            case 'MENSUAL': return 1;
            case 'BIMESTRAL': return 2;
            case 'TRIMESTRAL': return 3;
            case 'CUATRIMESTRAL': return 4;
            case 'SEMESTRAL': return 6;
            case 'ANUAL': return 12;
            default: return 1;
        }
    };

    if (!lastUpdate) {
        return { label: 'Pendiente', color: '#d32f2f' };
    }
    const last = new Date(lastUpdate);
    const deadline = new Date(last);
    deadline.setMonth(deadline.getMonth() + addMonths(periodicity));

    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 7) return { label: 'Actualizado', color: '#2e7d32' };
    if (diffDays > 0) return { label: 'Próximo a vencer', color: '#f57c00' };
    return { label: 'Vencido', color: '#d32f2f' };
};

export const IndicatorTable: React.FC<Props> = ({ indicators, role, onManage, onView, onEdit, onDelete }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [filterState, setFilterState] = useState<string>('ALL');
    const [filterProcess, setFilterProcess] = useState<string>('ALL');
    const [textSearch, setTextSearch] = useState<string>('');

    const processes = useMemo(() => {
        const set = new Set<string>();
        indicators.forEach((i) => { if (i.process) set.add(i.process); });
        return Array.from(set).sort();
    }, [indicators]);

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

            if (role === 'ADMIN' && filterState !== 'ALL') {
                const state = getStateFromDates(ind.lastUpdate, ind.periodicity);
                if (filterState === 'PENDIENTE' && state.label !== 'Pendiente') return false;
                if (filterState === 'PRÓXIMO' && state.label !== 'Próximo a vencer') return false;
                if (filterState === 'VENCIDO' && state.label !== 'Vencido') return false;
                if (filterState === 'ACTUALIZADO' && state.label !== 'Actualizado') return false;
            }

            return true;
        });
    }, [indicators, role, filterState, filterProcess, textSearch]);

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
                                <InputLabel>Estado</InputLabel>
                                <Select 
                                    value={filterState} 
                                    label="Estado"
                                    onChange={(e) => { setFilterState(e.target.value); setPage(0); }}
                                    sx={{ backgroundColor: 'white' }}
                                >
                                    <MenuItem value="ALL">Todos los estados</MenuItem>
                                    <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                                    <MenuItem value="PRÓXIMO">Próximo a vencer</MenuItem>
                                    <MenuItem value="VENCIDO">Vencido</MenuItem>
                                    <MenuItem value="ACTUALIZADO">Actualizado</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Proceso</InputLabel>
                                <Select 
                                    value={filterProcess} 
                                    label="Proceso"
                                    onChange={(e) => { setFilterProcess(e.target.value); setPage(0); }}
                                    sx={{ backgroundColor: 'white' }}
                                >
                                    <MenuItem value="ALL">Todos los procesos</MenuItem>
                                    {processes.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                                </Select>
                            </FormControl>

                            <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => {
                                    setFilterState('ALL');
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
                                const state = getStateFromDates(indicator.lastUpdate, indicator.periodicity);
                                const disabledActions = indicator.hasData === true && role !== 'ADMIN';
                                return (
                                    <TableRow key={indicator.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{indicator.name}</Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                {PERIODICITY_CONFIG.find(p => p.value === indicator.periodicity)?.label} · Fórmula: <span style={{ fontFamily: 'monospace' }}>{indicator.formula}</span>
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                                <Box sx={{ width: 10, height: 10, borderRadius: 0.5, backgroundColor: state.color, mr: 1 }} />
                                                <Box sx={{ backgroundColor: state.color + '1A', px: 1, py: 0.5, borderRadius: 0.75 }}>
                                                    <Typography variant="caption" sx={{ color: state.color, fontWeight: 700 }}>{state.label}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell><Typography variant="body2">{indicator.trend === 'ASC' ? 'Ascendente' : 'Descendente'}</Typography></TableCell>
                                        <TableCell><Typography variant="body2">{indicator.unit}</Typography></TableCell>
                                        <TableCell><Typography variant="body2">{indicator.responsible ?? '-'}</Typography></TableCell>

                                        {role === 'ADMIN' && <TableCell><Typography variant="body2">{indicator.process ?? '-'}</Typography></TableCell>}

                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title={disabledActions ? 'No se puede editar indicador gestionado' : 'Editar indicador'}>
                                                    <span>
                                                        <IconButton size="small" onClick={() => onEdit(indicator)} disabled={disabledActions}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>

                                                <Tooltip title={disabledActions ? 'No se puede eliminar indicador gestionado' : 'Eliminar indicador'}>
                                                    <span>
                                                        <IconButton size="small" onClick={() => onDelete(indicator)} disabled={disabledActions} color="error">
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
                                                <Button variant="outlined" size="small" startIcon={<VisibilityIcon />} sx={{ textTransform: 'none', borderColor: appColors.blue, color: appColors.blue }} onClick={() => onManage(indicator)}>
                                                    Gestionar
                                                </Button>
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