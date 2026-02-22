import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, Snackbar, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import type {
  AutoControlActivity,
  AutoControlOption,
  AutoControlRecord,
} from '@/types/autocontrol';
import type { FindingWithPlan, ImprovementPlanActivity } from '@/types/improvement';
import AutoControlTypeSelector from '../../components/improvement/autocontrol/AutoControlTypeSelector';
import AutoControlEmptyState from '../../components/improvement/autocontrol/AutoControlEmptyState';
import AutoControlRecordsTable from '../../components/improvement/autocontrol/AutoControlRecordsTable';
import AutoControlRecordDialog from '../../components/improvement/autocontrol/AutoControlRecordDialog';
import ManageImprovementPlanModal from '../../components/improvement/ManageImprovementPlanModal';
import ActivitiesPanel from '../../components/improvement/ActivitiesPanel';

const STORAGE_KEY = 'sigbaq_autocontrol_records';

const processOptions: AutoControlOption[] = [
  { id: 1, name: 'Gestión estratégica' },
  { id: 2, name: 'Gestión financiera' },
  { id: 3, name: 'Gestión documental' },
  { id: 4, name: 'Gestión del riesgo' },
];

const tipoAutocontrolOptions: AutoControlOption[] = [
  { id: 1, name: 'Indicadores de gestión' },
  { id: 2, name: 'Riesgos' },
  { id: 3, name: 'Otro' },
];

const origenOptions: AutoControlOption[] = [
  { id: 1, name: 'No conformidad' },
  { id: 2, name: 'Oportunidad de mejora' },
  { id: 3, name: 'Auditoría interna' },
  { id: 4, name: 'PQRSD' },
];

const estadoPlanOptions: AutoControlOption[] = [
  { id: 1, name: 'Abierto' },
  { id: 2, name: 'Cerrado' },
  { id: 3, name: 'Vencido' },
];

const mockRecords: AutoControlRecord[] = [
  {
    finding: {
      hacId: 1001,
      hacDescripcion: 'Desviación en cumplimiento mensual del indicador de PQRS.',
      fkProceso: 3,
      fkTipoAutocontrol: 1,
      fkOrigen: 3,
      fkCreadoPor: 1,
      hacReportadoPor: 'Líder de proceso',
      hacCreado: '2026-01-10T08:30:00.000Z',
      hacNormaNumeral: '9.1.1',
      hacEstado: true,
    },
    plan: {
      pmaId: 2001,
      fkHallazgoAutocontrol: 1001,
      pmaAnalisisDeCausa: 'Falta de estandarización en la captura de datos semanales.',
      pmaFechaProyectada: '2026-03-30',
      pmaCreadoEn: '2026-01-10T09:00:00.000Z',
      fkEstadoPlanAuto: 1,
      pmaEstado: true,
      pmaObservacion: 'Seguimiento quincenal con el equipo de atención al ciudadano.',
    },
    activities: [
      {
        ascId: 3001,
        fkPlanMejoraAutocontrol: 2001,
        ascDescripcionActividad: 'Definir formato único para consolidación de datos del indicador.',
        ascCreadoEl: '2026-01-10T10:00:00.000Z',
        ascSeguimiento1: 'Formato definido y socializado.',
        ascSeguimiento2: '',
        ascSeguimiento3: '',
        ascSeguimiento4: '',
        ascAnexoSeguimiento1: '',
        ascAnexoSeguimiento2: '',
        ascAnexoSeguimiento3: '',
        ascAnexoSeguimiento4: '',
        ascObservSeguimiento1: 'Validar adopción en todas las áreas.',
        ascObservSeguimiento2: '',
        ascObservSeguimiento3: '',
        ascObservSeguimiento4: '',
        ascEstado: true,
        ascCerrado: false,
      },
    ],
  },
  {
    finding: {
      hacId: 1002,
      hacDescripcion: 'Meta trimestral del indicador de oportunidad no alcanzada.',
      fkProceso: 1,
      fkTipoAutocontrol: 1,
      fkOrigen: 3,
      fkCreadoPor: 1,
      hacReportadoPor: 'Analista de calidad',
      hacCreado: '2026-01-22T11:15:00.000Z',
      hacNormaNumeral: '10.3',
      hacEstado: true,
    },
    plan: {
      pmaId: 2002,
      fkHallazgoAutocontrol: 1002,
      pmaAnalisisDeCausa: 'Retrasos en cierre de actividades de mejora por priorización operativa.',
      pmaFechaProyectada: '2026-04-15',
      pmaCreadoEn: '2026-01-22T12:00:00.000Z',
      fkEstadoPlanAuto: 2,
      pmaEstado: true,
      pmaObservacion: 'Se completó plan de choque y se estabilizó el indicador.',
    },
    activities: [
      {
        ascId: 3002,
        fkPlanMejoraAutocontrol: 2002,
        ascDescripcionActividad: 'Ejecutar plan de choque con responsables por área.',
        ascCreadoEl: '2026-01-22T12:30:00.000Z',
        ascSeguimiento1: 'Plan ejecutado al 100%.',
        ascSeguimiento2: 'Indicador volvió a rango esperado.',
        ascSeguimiento3: '',
        ascSeguimiento4: '',
        ascAnexoSeguimiento1: '',
        ascAnexoSeguimiento2: '',
        ascAnexoSeguimiento3: '',
        ascAnexoSeguimiento4: '',
        ascObservSeguimiento1: 'Lección aprendida documentada.',
        ascObservSeguimiento2: 'Cerrar actividad en comité de calidad.',
        ascObservSeguimiento3: '',
        ascObservSeguimiento4: '',
        ascEstado: true,
        ascCerrado: true,
      },
    ],
  },
  {
    finding: {
      hacId: 1003,
      hacDescripcion: 'Riesgo operativo materializado en reporte mensual.',
      fkProceso: 4,
      fkTipoAutocontrol: 2,
      fkOrigen: 4,
      fkCreadoPor: 1,
      hacReportadoPor: 'Gestor de riesgo',
      hacCreado: '2026-02-01T07:50:00.000Z',
      hacNormaNumeral: '6.1',
      hacEstado: true,
    },
    plan: {
      pmaId: 2003,
      fkHallazgoAutocontrol: 1003,
      pmaAnalisisDeCausa: 'Controles preventivos incompletos en etapa de ejecución.',
      pmaFechaProyectada: '2026-05-10',
      pmaCreadoEn: '2026-02-01T08:20:00.000Z',
      fkEstadoPlanAuto: 1,
      pmaEstado: true,
      pmaObservacion: '',
    },
    activities: [
      {
        ascId: 3003,
        fkPlanMejoraAutocontrol: 2003,
        ascDescripcionActividad: 'Actualizar matriz de riesgos y responsables de control.',
        ascCreadoEl: '2026-02-01T08:30:00.000Z',
        ascSeguimiento1: '',
        ascSeguimiento2: '',
        ascSeguimiento3: '',
        ascSeguimiento4: '',
        ascAnexoSeguimiento1: '',
        ascAnexoSeguimiento2: '',
        ascAnexoSeguimiento3: '',
        ascAnexoSeguimiento4: '',
        ascObservSeguimiento1: '',
        ascObservSeguimiento2: '',
        ascObservSeguimiento3: '',
        ascObservSeguimiento4: '',
        ascEstado: true,
        ascCerrado: false,
      },
    ],
  },
];

const toIsoNow = () => new Date().toISOString();

const createEmptyActivity = (planId: number): AutoControlActivity => ({
  ascId: Date.now(),
  fkPlanMejoraAutocontrol: planId,
  ascDescripcionActividad: '',
  ascCreadoEl: toIsoNow(),
  ascSeguimiento1: '',
  ascSeguimiento2: '',
  ascSeguimiento3: '',
  ascSeguimiento4: '',
  ascAnexoSeguimiento1: '',
  ascAnexoSeguimiento2: '',
  ascAnexoSeguimiento3: '',
  ascAnexoSeguimiento4: '',
  ascObservSeguimiento1: '',
  ascObservSeguimiento2: '',
  ascObservSeguimiento3: '',
  ascObservSeguimiento4: '',
  ascEstado: true,
  ascCerrado: false,
});

const createEmptyDraft = (userId: number): AutoControlRecord => {
  const findingId = Date.now();
  const planId = findingId + 1;

  return {
    finding: {
      hacId: findingId,
      hacDescripcion: '',
      fkProceso: 0,
      fkTipoAutocontrol: 0,
      fkOrigen: 0,
      fkCreadoPor: userId,
      hacReportadoPor: '',
      hacCreado: toIsoNow(),
      hacNormaNumeral: '',
      hacEstado: true,
    },
    plan: {
      pmaId: planId,
      fkHallazgoAutocontrol: findingId,
      pmaAnalisisDeCausa: '',
      pmaFechaProyectada: '',
      pmaCreadoEn: toIsoNow(),
      fkEstadoPlanAuto: 1,
      pmaEstado: true,
      pmaObservacion: '',
    },
    activities: [createEmptyActivity(planId)],
  };
};

const getLocalRecords = (): AutoControlRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockRecords;
    const parsed = JSON.parse(raw) as AutoControlRecord[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : mockRecords;
  } catch {
    return mockRecords;
  }
};

const saveLocalRecords = (records: AutoControlRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

type ManageFinding = {
  id: number;
  findingType: string;
  activities: Array<{ id: number; description: string }>;
};

const mapAutoActivityToImprovement = (
  activity: AutoControlActivity,
): ImprovementPlanActivity => ({
  id: activity.ascId,
  description: activity.ascDescripcionActividad,
  closed: activity.ascCerrado,
  followup1: activity.ascSeguimiento1,
  followup2: activity.ascSeguimiento2,
  followup3: activity.ascSeguimiento3,
  followup4: activity.ascSeguimiento4,
  followup1Sent: Boolean(activity.ascSeguimiento1),
  followup2Sent: Boolean(activity.ascSeguimiento2),
  followup3Sent: Boolean(activity.ascSeguimiento3),
  followup4Sent: Boolean(activity.ascSeguimiento4),
  followup1Comment: activity.ascObservSeguimiento1,
  followup2Comment: activity.ascObservSeguimiento2,
  followup3Comment: activity.ascObservSeguimiento3,
  followup4Comment: activity.ascObservSeguimiento4,
  files: {
    1: activity.ascAnexoSeguimiento1 ? { url: activity.ascAnexoSeguimiento1 } : null,
    2: activity.ascAnexoSeguimiento2 ? { url: activity.ascAnexoSeguimiento2 } : null,
    3: activity.ascAnexoSeguimiento3 ? { url: activity.ascAnexoSeguimiento3 } : null,
    4: activity.ascAnexoSeguimiento4 ? { url: activity.ascAnexoSeguimiento4 } : null,
  },
});

const getFindingTypeByFuente = (fuenteId: number): string => {
  const fuente = origenOptions.find((item) => item.id === fuenteId)?.name.toLowerCase() || '';
  return fuente.includes('oportunidad') ? 'Oportunidad de mejora' : 'No conformidad';
};

export default function AutoControlActionsPage() {
  const { session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = session?.user?.id ?? 0;

  const [records, setRecords] = useState<AutoControlRecord[]>(() => getLocalRecords());
  const [selectedTipoId, setSelectedTipoId] = useState<number | ''>('');
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<AutoControlRecord>(() => createEmptyDraft(userId));
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedManageFinding, setSelectedManageFinding] = useState<ManageFinding | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedViewFinding, setSelectedViewFinding] = useState<FindingWithPlan | null>(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    sev: 'success' | 'error';
  }>({ open: false, msg: '', sev: 'success' });

  const processById = useMemo(() => new Map(processOptions.map((o) => [o.id, o.name])), []);
  const tipoById = useMemo(() => new Map(tipoAutocontrolOptions.map((o) => [o.id, o.name])), []);
  const origenById = useMemo(() => new Map(origenOptions.map((o) => [o.id, o.name])), []);
  const estadoPlanById = useMemo(() => new Map(estadoPlanOptions.map((o) => [o.id, o.name])), []);

  const filteredRecords = useMemo(() => {
    if (!selectedTipoId) return [];
    return records.filter(
      (record) => record.finding.fkTipoAutocontrol === Number(selectedTipoId),
    );
  }, [records, selectedTipoId]);

  const isIndicadoresSelected = Number(selectedTipoId) === 1;
  const cameFromIndicators =
    (location.state as { fromModule?: string } | null)?.fromModule === 'indicators';

  useEffect(() => {
    const state = location.state as { autoSelectTipoId?: number } | null;
    if (state?.autoSelectTipoId && selectedTipoId === '') {
      setSelectedTipoId(state.autoSelectTipoId);
    }
  }, [location.state, selectedTipoId]);

  const handleOpenManage = (findingId: number) => {
    const record = records.find((item) => item.finding.hacId === findingId);
    if (!record) return;

    setSelectedManageFinding({
      id: record.finding.hacId,
      findingType: getFindingTypeByFuente(record.finding.fkOrigen),
      activities: [],
    });
    setManageOpen(true);
  };

  const handleOpenView = (findingId: number) => {
    const record = records.find((item) => item.finding.hacId === findingId);
    if (!record) return;

    setSelectedViewFinding({
      id: String(record.finding.hacId),
      date: record.finding.hacCreado,
      findingType: getFindingTypeByFuente(record.finding.fkOrigen),
      auditType: 'Autocontrol',
      source: origenById.get(record.finding.fkOrigen) || '',
      requirementNumeral: record.finding.hacNormaNumeral,
      condition: record.plan.pmaAnalisisDeCausa,
      description: record.finding.hacDescripcion,
      reportedBy: record.finding.hacReportadoPor,
      status: estadoPlanById.get(record.plan.fkEstadoPlanAuto) || 'Abierto',
      dueDate: record.plan.pmaFechaProyectada,
      auditedProcess: processById.get(record.finding.fkProceso) || '',
      causeAnalysis: record.plan.pmaAnalisisDeCausa,
      activities: (record.activities || []).map(mapAutoActivityToImprovement),
      improvementPlan: {
        id: record.plan.pmaId,
        findingId: record.finding.hacId,
        causeAnalysis: record.plan.pmaAnalisisDeCausa,
        startDate: '',
        endDate: record.plan.pmaFechaProyectada,
        status: record.plan.fkEstadoPlanAuto,
      },
    });
    setViewOpen(true);
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setSelectedViewFinding(null);
  };

  const handleCloseManage = () => {
    setManageOpen(false);
    setSelectedManageFinding(null);
  };

  const handleSaveManage = (updated: {
    id: string | number;
    analisisCausa: string;
    actividades: string[];
    fechaInicio: string;
    fechaFin: string;
    estado?: string;
  }) => {
    const findingId = Number(updated.id);

    const updatedActivities: AutoControlActivity[] = updated.actividades.map((description, index) => ({
      ascId: Date.now() + index,
      fkPlanMejoraAutocontrol: Date.now(),
      ascDescripcionActividad: description,
      ascCreadoEl: toIsoNow(),
      ascSeguimiento1: '',
      ascSeguimiento2: '',
      ascSeguimiento3: '',
      ascSeguimiento4: '',
      ascAnexoSeguimiento1: '',
      ascAnexoSeguimiento2: '',
      ascAnexoSeguimiento3: '',
      ascAnexoSeguimiento4: '',
      ascObservSeguimiento1: '',
      ascObservSeguimiento2: '',
      ascObservSeguimiento3: '',
      ascObservSeguimiento4: '',
      ascEstado: true,
      ascCerrado: false,
    }));

    const nextRecords = records.map((record) => {
      if (record.finding.hacId !== findingId) return record;

      return {
        ...record,
        plan: {
          ...record.plan,
          pmaAnalisisDeCausa: updated.analisisCausa,
          pmaFechaProyectada: updated.fechaFin,
        },
        activities: updatedActivities,
      };
    });

    setRecords(nextRecords);
    saveLocalRecords(nextRecords);
    setSnack({
      open: true,
      msg: 'Plan de mejoramiento gestionado correctamente.',
      sev: 'success',
    });
    handleCloseManage();
  };

  const handleOpenCreate = (findingId: number) => {
    const base = records.find((record) => record.finding.hacId === findingId);
    const nextDraft = createEmptyDraft(userId);

    if (base) {
      nextDraft.finding.hacDescripcion = base.finding.hacDescripcion;
      nextDraft.finding.fkTipoAutocontrol = base.finding.fkTipoAutocontrol;
      nextDraft.finding.fkOrigen = base.finding.fkOrigen;
      nextDraft.finding.hacNormaNumeral = base.finding.hacNormaNumeral;
      nextDraft.finding.hacCreado = base.finding.hacCreado;
    }

    setEditingIndex(null);
    setDraft(nextDraft);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingIndex(null);
  };

  const handleBackToIndicators = () => {
    navigate('/indicadores-de-gestion');
  };

  const validateDraft = () => {
    const hasTipo = draft.finding.fkTipoAutocontrol > 0;
    const hasFecha = Boolean(draft.finding.hacCreado);
    const hasFuente = draft.finding.fkOrigen > 0;
    const hasNumeral = draft.finding.hacNormaNumeral.trim().length > 0;
    const hasCondicion = draft.plan.pmaAnalisisDeCausa.trim().length > 0;
    const hasDescripcion = draft.finding.hacDescripcion.trim().length > 0;

    return Boolean(
      hasTipo &&
      hasFecha &&
      hasFuente &&
      hasNumeral &&
      hasCondicion &&
      hasDescripcion,
    );
  };

  const handleSave = () => {
    if (!validateDraft()) {
      setSnack({
        open: true,
        msg: 'Completa los campos obligatorios: tipo, fecha, fuente, numeral, condición y descripción.',
        sev: 'error',
      });
      return;
    }

    const next = [...records];
    if (editingIndex === null) {
      next.unshift(draft);
    } else {
      next[editingIndex] = draft;
    }

    setRecords(next);
    saveLocalRecords(next);
    setOpen(false);
    setEditingIndex(null);
    setSnack({
      open: true,
      msg: editingIndex === null ? 'Registro creado.' : 'Registro actualizado.',
      sev: 'success',
    });
  };

  return (
    <Box>
      {cameFromIndicators && (
        <Box sx={{ mb: 1.5 }}>
          <Button variant="text" onClick={handleBackToIndicators} sx={{ textTransform: 'none' }}>
            ← Volver a indicadores
          </Button>
        </Box>
      )}

      <AutoControlTypeSelector
        value={selectedTipoId}
        options={tipoAutocontrolOptions}
        onChange={setSelectedTipoId}
      />

      {selectedTipoId === '' ? (
        <AutoControlEmptyState />
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tipo seleccionado: {tipoById.get(Number(selectedTipoId))}
          </Typography>

          <AutoControlRecordsTable
            records={filteredRecords}
            isIndicadoresSelected={isIndicadoresSelected}
            tipoById={tipoById}
            processById={processById}
            origenById={origenById}
            estadoPlanById={estadoPlanById}
            onCreatePlan={handleOpenCreate}
            onManagePlan={handleOpenManage}
            onViewPlan={handleOpenView}
          />
        </>
      )}

      <AutoControlRecordDialog
        open={open}
        draft={draft}
        tipoAutocontrolOptions={tipoAutocontrolOptions}
        origenOptions={origenOptions}
        onClose={handleClose}
        onSave={handleSave}
        onSetDraft={setDraft}
      />

      <ManageImprovementPlanModal
        open={manageOpen}
        onClose={handleCloseManage}
        finding={selectedManageFinding}
        onSave={handleSaveManage}
      />

      <Dialog open={viewOpen} onClose={handleCloseView} maxWidth="lg" fullWidth>
        <DialogTitle>Actividades</DialogTitle>
        <DialogContent>
          {selectedViewFinding && (
              <ActivitiesPanel
              finding={selectedViewFinding}
              hideObservations
              hideFollowupStatus
                enableSend={false}
            />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snack.sev}
          variant="filled"
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
