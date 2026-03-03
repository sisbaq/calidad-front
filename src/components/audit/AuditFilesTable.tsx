import * as React from "react";
import {
    Paper, Table, TableHead, TableBody, TableRow, TableCell,
    TableContainer, TablePagination, Button, Tooltip
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import type { AuditPlan } from "@/types/audit";
import { downloadPlanAuditoriaFile, downloadInformeAuditoriaFile } from "@/services/file.service";
import { parseDateString } from "@/utils/dateUtils";

const AZUL = "#0e2336";

export interface FileRef {
    url?: string;
    tipo?: string;
    sizeLabel?: string;
}

export interface AuditRow {
    id: string | number;
    titulo: string;
    fecha: string;
    plan: FileRef;
    informe: FileRef;
}

export interface AuditFilesTableProps {
    rows?: AuditPlan[];
    rowsPerPageDefault?: number;
    rowsPerPageOptions?: number[];
    onDescargarPlan?: (planUrl: string, planName: string) => void;
    onDescargarInforme?: (informeUrl: string, informeName: string) => void;
}

function formatDate(iso: string): string {
    try {
        // Verificar si es formato YYYY-MM-DD o ISO string
        const date = iso.match(/^\d{4}-\d{2}-\d{2}$/)
            ? parseDateString(iso)
            : new Date(iso);
        
        return date.toLocaleDateString("es-CO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    } catch {
        return iso;
    }
}

export default function AuditFilesTable({
    rows = [],
    rowsPerPageDefault = 2,
    rowsPerPageOptions = [2],
    onDescargarPlan,
    onDescargarInforme,
}: AuditFilesTableProps) {
    const [page, setPage] = React.useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(rowsPerPageDefault);

    const handleChangePage = (_e: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const slice = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", width: "100%" }}>
            <TableContainer>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}> Descripción del informe</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, width: 220 }}>
                                Descargar plan
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, width: 240 }}>
                                Descargar informe
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {slice.flatMap((plan) => {
                            const hasPlan = Boolean(plan.fileMeta?.url);

                            // If plan has no reports, show one row with just the plan
                            if (!plan.reports || plan.reports.length === 0) {
                                return (
                                    <TableRow key={`plan-${plan.id}`} hover>
                                        <TableCell>{formatDate(plan.createdAt)}</TableCell>
                                        <TableCell>{plan.description}</TableCell>

                                        <TableCell align="center">
                                            <Tooltip title={hasPlan ? "Descargar plan de auditoría" : "No disponible"}>
                                                <span>
                                                    <Button
                                                        variant={hasPlan ? "contained" : "outlined"}
                                                        size="small"
                                                        startIcon={<DownloadRoundedIcon sx={{ color: hasPlan ? "#fff" : AZUL }} />}
                                                        disabled={!hasPlan}
                                                        onClick={() =>
                                                            hasPlan &&
                                                            (onDescargarPlan
                                                                ? onDescargarPlan(plan.fileMeta.url, plan.fileMeta.name)
                                                                : downloadPlanAuditoriaFile(plan.id).catch(console.error))
                                                        }
                                                        sx={{
                                                            textTransform: "none",
                                                            borderRadius: 2,
                                                            bgcolor: hasPlan ? AZUL : "transparent",
                                                            color: hasPlan ? "#fff" : AZUL,
                                                            borderColor: AZUL,
                                                            "&:hover": {
                                                                bgcolor: hasPlan ? "#0b1c2b" : "transparent",
                                                                borderColor: "#0b1c2b",
                                                            },
                                                        }}
                                                    >
                                                        Descargar plan
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Tooltip title="No hay informes disponibles">
                                                <span>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<DownloadRoundedIcon sx={{ color: AZUL }} />}
                                                        disabled
                                                        sx={{
                                                            textTransform: "none",
                                                            borderRadius: 2,
                                                            bgcolor: "transparent",
                                                            color: AZUL,
                                                            borderColor: AZUL,
                                                        }}
                                                    >
                                                        Sin informe
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            }

                            // If plan has reports, show one row per report
                            return plan.reports.map((report) => {
                                const hasInforme = Boolean(report.url);

                                return (
                                    <TableRow key={`plan-${plan.id}-report-${report.id}`} hover>
                                        <TableCell>{formatDate(report.createdAt)}</TableCell>
                                        <TableCell>{report.desc || plan.description}</TableCell>

                                        <TableCell align="center">
                                            <Tooltip title={hasPlan ? "Descargar plan de auditoría" : "No disponible"}>
                                                <span>
                                                    <Button
                                                        variant={hasPlan ? "contained" : "outlined"}
                                                        size="small"
                                                        startIcon={<DownloadRoundedIcon sx={{ color: hasPlan ? "#fff" : AZUL }} />}
                                                        disabled={!hasPlan}
                                                        onClick={() =>
                                                            hasPlan &&
                                                            (onDescargarPlan
                                                                ? onDescargarPlan(plan.fileMeta.url, plan.fileMeta.name)
                                                                : downloadPlanAuditoriaFile(plan.id).catch(console.error))
                                                        }
                                                        sx={{
                                                            textTransform: "none",
                                                            borderRadius: 2,
                                                            bgcolor: hasPlan ? AZUL : "transparent",
                                                            color: hasPlan ? "#fff" : AZUL,
                                                            borderColor: AZUL,
                                                            "&:hover": {
                                                                bgcolor: hasPlan ? "#0b1c2b" : "transparent",
                                                                borderColor: "#0b1c2b",
                                                            },
                                                        }}
                                                    >
                                                        Descargar plan
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Tooltip title={hasInforme ? "Descargar informe de auditoría" : "No disponible"}>
                                                <span>
                                                    <Button
                                                        variant={hasInforme ? "contained" : "outlined"}
                                                        size="small"
                                                        startIcon={<DownloadRoundedIcon sx={{ color: hasInforme ? "#fff" : AZUL }} />}
                                                        disabled={!hasInforme}
                                                        onClick={() =>
                                                            hasInforme &&
                                                            (onDescargarInforme
                                                                ? onDescargarInforme(report.url, report.name)
                                                                : downloadInformeAuditoriaFile(report.id).catch(console.error))
                                                        }
                                                        sx={{
                                                            textTransform: "none",
                                                            borderRadius: 2,
                                                            bgcolor: hasInforme ? AZUL : "transparent",
                                                            color: hasInforme ? "#fff" : AZUL,
                                                            borderColor: AZUL,
                                                            "&:hover": {
                                                                bgcolor: hasInforme ? "#0b1c2b" : "transparent",
                                                                borderColor: "#0b1c2b",
                                                            },
                                                        }}
                                                    >
                                                        Descargar informe
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            });
                        })}
                        {slice.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6, color: "text.secondary" }}>
                                    No se encontraron archivos.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={rows.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={rowsPerPageOptions}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) => `Mostrando ${from}-${to} de ${count}`}
            />
        </Paper>
    );
}
