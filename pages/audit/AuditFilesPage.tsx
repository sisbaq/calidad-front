import * as React from "react";
import { Box, Stack, Typography, Container } from "@mui/material";
import SearchInput from "../../components/audit/SearchInput";
import AuditFilesTable from "../../components/audit/AuditFilesTable";
import { getAuditPlansWithReports } from "@services/audit.service"
import type { AuditPlan } from "@/types/audit";

export interface AuditFilesPageProps {
    titulo?: string;
    subtitulo?: string;
}

export default function AuditFilesPage({
    titulo = "Consulta y descarga los planes e informes de auditoría",
    subtitulo = "Visualiza y descarga los archivos disponibles",
}: AuditFilesPageProps) {
    const [q, setQ] = React.useState<string>("");
    const [auditPlans, setAuditPlans] = React.useState<AuditPlan[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const plans = await getAuditPlansWithReports();
                setAuditPlans(plans);
            } catch (error) {
                console.error("Error fetching audit plans with reports:", error);
            }
        };

        fetchData();
    }, []);

    const filteredPlans = React.useMemo<AuditPlan[]>(() => {
        const term = q.trim().toLowerCase();

        // If no search term, return all plans
        if (!term) return auditPlans;

        return auditPlans
            .map((plan) => {
                // Check if plan itself matches
                const planMatches = [
                    plan.description,
                    plan.planLabel,
                    plan.planType,
                ]
                    .filter(Boolean)
                    .some((text) => String(text).toLowerCase().includes(term));

                // If plan matches, return it with all reports
                if (planMatches) {
                    return plan;
                }

                // Otherwise, filter reports that match
                const matchingReports = (plan.reports || []).filter((report) =>
                    [report.desc, report.name]
                        .filter(Boolean)
                        .some((text) => String(text).toLowerCase().includes(term))
                );

                // If any reports match, return plan with only matching reports
                if (matchingReports.length > 0) {
                    return {
                        ...plan,
                        reports: matchingReports,
                    };
                }

                // No match, exclude this plan
                return null;
            })
            .filter((plan): plan is AuditPlan => plan !== null);
    }, [q, auditPlans]);

    return (
        <Container maxWidth={false} disableGutters sx={{ py: 3, px: 2 }}>
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {subtitulo}
                    </Typography>
                </Box>

                <SearchInput value={q} onChange={setQ} placeholder="Buscar" />

                <AuditFilesTable
                    rows={filteredPlans}
                    rowsPerPageDefault={5}
                    rowsPerPageOptions={[5, 10, 25]}
                    onDescargarPlan={(planUrl: string) => {
                        window.location.href = planUrl;
                    }}
                    onDescargarInforme={(informeUrl: string) => {
                        window.location.href = informeUrl;
                    }}
                />
            </Stack>
        </Container>
    );
}
