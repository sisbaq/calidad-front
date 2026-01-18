import { useMemo, useState, useEffect } from 'react';
import { Box, Snackbar, Alert, Typography, CircularProgress } from '@mui/material';
import GlobalSearch from '@components/improvement/GlobalSearch';
import FindingsTableCollapse from '@components/improvement/FindingsTableCollapse';
import ManageImprovementPlanModal from '@components/improvement/ManageImprovementPlanModal';
import { getFindingsByProcess } from '@services/findings.service';
import {
  getImprovementPlans,
  createImprovementPlan,
  createImprovementPlanActivities,
  updateImprovementPlanActivity,
  uploadActivityFollowupFile,
  getImprovementPlanActivitiesByFindingId,
} from '@services/improvement.service';
import type {
  FindingWithPlan,
  ImprovementPlanActivity,
  ImprovementPlanFilters,
  ImprovementPlan,
} from '@/types/improvement';

function serializeActivities(activities: ImprovementPlanActivity[]): string {
  return (activities || [])
    .map((a) => String(a.description || '').trim())
    .filter(Boolean)
    .join('\n');
}

function getYear(fechaStr: string | undefined): number | null {
  if (!fechaStr) return null;
  const d = new Date(fechaStr);
  if (isNaN(d.getTime())) return null;
  return d.getFullYear();
}

export default function ManageImprovementPlansPage({
  processName = 'Gestión Documental',
}: {
  processName?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<FindingWithPlan[]>([]);
  const [filters, setFilters] = useState<ImprovementPlanFilters>({
    tipo: '',
    estado: '',
    year: '',
  });
  const [improvementPlans, setImprovementPlans] = useState<ImprovementPlan[]>([]);
  const [selected, setSelected] = useState<FindingWithPlan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const findingsResponse = await getFindingsByProcess();

      const plansResponse = await getImprovementPlans();

      const mappedFindings: FindingWithPlan[] = findingsResponse.map((finding) => {
        const improvementPlan = plansResponse.find(
          (plan) => String(plan.findingId) === String(finding.id)
        );

        return {
          id: finding.id,
          date: finding.date,
          findingType: finding.findingType,
          auditType: finding.auditType,
          source: finding.source,
          requirementNumeral: finding.requirementNumeral,
          condition: finding.condition,
          description: finding.description,
          reportedBy: finding.reportedBy,
          status: 'Abierto',
          dueDate: improvementPlan?.endDate || '',
          auditedProcess: finding.auditedProcess,
          causeAnalysis: improvementPlan?.causeAnalysis,
          activities: [],
          improvementActivities: '',
          improvementPlan: improvementPlan,
        };
      });

      setRows(mappedFindings);
      setImprovementPlans(plansResponse);
    } catch (error) {
      console.error('Failed to load data:', error);
      setErr(true);
    } finally {
      setLoading(false);
    }
  };

  const tipoOptions = useMemo(() => {
    const s = new Set(rows.map((r) => r.findingType).filter(Boolean));
    return Array.from(s);
  }, [rows]);

  const yearOptions = useMemo(() => {
    const s = new Set(rows.map((r) => getYear(r.date)).filter(Boolean));
    return Array.from(s).sort((a, b) => (b || 0) - (a || 0)) as number[];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows
      .filter((r) => !processName || r.auditedProcess.startsWith(processName))
      .filter((r) => !filters.tipo || r.findingType === filters.tipo)
      .filter((r) => !filters.estado || (r.status || 'Abierto') === filters.estado)
      .filter((r) => {
        if (!filters.year) return true;
        const y = getYear(r.date);
        return Number(filters.year) === y;
      });
  }, [rows, filters, processName]);

  const handleExpand = async (findingId: string | number) => {
    const finding = rows.find((r) => String(r.id) === String(findingId));
    if (!finding || (finding.activities && finding.activities.length > 0)) {
      return;
    }

    try {
      const activities = await getImprovementPlanActivitiesByFindingId(findingId);
      setRows((prevRows) =>
        prevRows.map((row) => {
          if (String(row.id) === String(findingId)) {
            return {
              ...row,
              activities,
              improvementActivities: serializeActivities(activities),
            };
          }
          return row;
        })
      );
    } catch (error) {
      console.error('Failed to load activities:', error);
      setErr(true);
    }
  };

  const openManage = (finding: FindingWithPlan) => {
    setSelected(finding);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  const closeManage = () => {
    setModalOpen(false);
    setSelected(null);
  };

  const saveManage = async (updated: {
    id: string | number;
    analisisCausa: string;
    actividades: string[];
    fechaInicio: string;
    fechaFin: string;
    estado?: string;
  }) => {
    try {
      const rowId = updated.id ?? selected?.id;
      if (!rowId) return;

      // Single request with nested activities
      const planPayload = {
        plmAnalisisDeCausa: updated.analisisCausa,
        plmFechaInicio: updated.fechaInicio,
        plmFechaFinal: updated.fechaFin,
        plmEstadoPlan: 1,
        fkIdHallazgo: Number(rowId),
        actividades: updated.actividades.map((actividad) => ({
          actNomActividad: actividad,
          actSeguimiento1: '',
          actSeguimiento2: '',
          actSeguimiento3: '',
          actSeguimiento4: '',
          actAnexoSeguimiento1: '',
          actAnexoSeguimiento2: '',
          actAnexoSeguimiento3: '',
          actAnexoSeguimiento4: '',
        })),
      };

      const createdPlan = await createImprovementPlan(planPayload);

      // Activities are already included in createdPlan.activities
      const createdActivities = createdPlan.activities || [];

      setRows((prev) =>
        prev.map((r) => {
          if (String(r.id) !== String(rowId)) return r;

          const nextActivities = createdActivities;
          const improvementActivities = serializeActivities(nextActivities);

          return {
            ...r,
            causeAnalysis: updated.analisisCausa,
            dueDate: updated.fechaFin,
            activities: nextActivities,
            improvementActivities,
            status: updated.estado || r.status || 'Abierto',
            improvementPlan: createdPlan,
          };
        })
      );

      setOk(true);
      closeManage();
    } catch (e) {
      console.error(e);
      setErr(true);
    }
  };

  const handleUpdateSeg = async ({
    findingId,
    activityId,
    segKey,
    value,
  }: {
    findingId: string | number;
    activityId: string | number;
    segKey: string;
    value: string;
  }) => {
    try {
      const fieldMap: Record<string, string> = {
        followup1: 'actSeguimiento1',
        followup2: 'actSeguimiento2',
        followup3: 'actSeguimiento3',
        followup4: 'actSeguimiento4',
      };

      await updateImprovementPlanActivity(activityId, {
        [fieldMap[segKey]]: value,
      });

      setRows((prev) =>
        prev.map((r) => {
          if (String(r.id) !== String(findingId)) return r;
          const updatedActs = (r.activities || []).map((a) =>
            a.id === activityId ? { ...a, [segKey]: value } : a
          );
          const updated = { ...r, activities: updatedActs };
          updated.improvementActivities = serializeActivities(updatedActs);
          return updated;
        })
      );
      setOk(true);
    } catch (e) {
      console.error(e);
      setErr(true);
    }
  };

  const handleSendSeg = async ({
    findingId,
    activityId,
    segKey,
    value,
    file,
  }: {
    findingId: string | number;
    activityId: string | number;
    segKey: string;
    value: string;
    file?: File;
  }) => {
    try {
      const sentFlag =
        segKey === 'followup1'
          ? 'followup1Sent'
          : segKey === 'followup2'
          ? 'followup2Sent'
          : segKey === 'followup3'
          ? 'followup3Sent'
          : 'followup4Sent';

      const followupNum = (
        segKey === 'followup1'
          ? 1
          : segKey === 'followup2'
          ? 2
          : segKey === 'followup3'
          ? 3
          : 4
      ) as 1 | 2 | 3 | 4;

      const fieldMap: Record<string, string> = {
        followup1: 'actSeguimiento1',
        followup2: 'actSeguimiento2',
        followup3: 'actSeguimiento3',
        followup4: 'actSeguimiento4',
      };

      await updateImprovementPlanActivity(activityId, {
        [fieldMap[segKey]]: value,
      });

      if (file) {
        await uploadActivityFollowupFile(activityId, followupNum, file);
      }

      setRows((prev) =>
        prev.map((r) => {
          if (String(r.id) !== String(findingId)) return r;
          const updatedActs = (r.activities || []).map((a) =>
            a.id === activityId ? { ...a, [segKey]: value, [sentFlag]: true } : a
          );
          const updated = { ...r, activities: updatedActs };
          updated.improvementActivities = serializeActivities(updatedActs);
          return updated;
        })
      );
      setOk(true);
    } catch (e) {
      console.error(e);
      setErr(true);
    }
  };

  const onAddActivity = async (findingId: string | number, activity: string) => {
    try {
      const plan = improvementPlans.find((p) => String(p.findingId) === String(findingId));
      if (!plan) {
        throw new Error('No improvement plan found for the given finding.');
      }

      const createdActivities = await createImprovementPlanActivities([
        {
          actNomActividad: activity,
          actSeguimiento1: '',
          actSeguimiento2: '',
          actSeguimiento3: '',
          actSeguimiento4: '',
          fkPlanMejoramiento: Number(plan.id),
          actAnexoSeguimiento1: '',
          actAnexoSeguimiento2: '',
          actAnexoSeguimiento3: '',
          actAnexoSeguimiento4: '',
        },
      ]);

      setRows((prev) =>
        prev.map((r) => {
          if (String(r.id) !== String(findingId)) return r;

          const updatedActivities = [...(r.activities || []), ...createdActivities];
          const improvementActivities = serializeActivities(updatedActivities);

          return {
            ...r,
            activities: updatedActivities,
            improvementActivities,
          };
        })
      );

      setOk(true);
    } catch (error) {
      console.error('Failed to add activity:', error);
      setErr(true);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
        Gestión de Hallazgos
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary' }}>
        Gestiona tus hallazgos, actividades y seguimientos.
      </Typography>

      <GlobalSearch
        tipoOptions={tipoOptions}
        yearOptions={yearOptions}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <FindingsTableCollapse
        rows={filteredRows}
        onManage={openManage}
        pageSize={10}
        onAddActivity={(id, act) => { void onAddActivity(id, act); }}
        onUpdateSeg={handleUpdateSeg}
        onSendSeg={handleSendSeg}
        onExpand={(id) => { void handleExpand(id); }}
      />

      <ManageImprovementPlanModal
        key={modalKey}
        open={modalOpen}
        onClose={closeManage}
        finding={selected}

        onSave={(u) => { void saveManage(u); }}
      />

      <Snackbar open={ok} autoHideDuration={3000} onClose={() => setOk(false)}>
        <Alert severity="success" onClose={() => setOk(false)}>
          Operación exitosa
        </Alert>
      </Snackbar>
      <Snackbar open={err} autoHideDuration={3000} onClose={() => setErr(false)}>
        <Alert severity="error" onClose={() => setErr(false)}>
          Ocurrió un error
        </Alert>
      </Snackbar>
    </Box>
  );
}
