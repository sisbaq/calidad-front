import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  MenuItem,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";

import {
  AUDIT_TYPES
} from "@constants/findings.constants";
import { getProcesses, getSources, getFindingTypes } from "@services/findings.service";
import { getAuditReports } from "@services/audit.service";
import type { ProcessOption, SourceOption, AuditReport, FindingTypeOption } from "@/types/audit";
import {
  getInitialFindingData,
  getInitialTouchedState,
  validateFinding,
} from "@validators/findings.validators";
import type { Finding } from "@/types/audit";

const PALETTE = {
  blue: "#142334",
  green: "#279B48",
  surface: "#F6F8FA",
  border: "#E5E7EB",
};

function SectionHeader({ icon: Icon, color, children }: { icon: React.ElementType, color: string, children: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mt: 2, mb: 1 }}>
      <Icon sx={{ fontSize: 20, color }} />
      <Typography variant="subtitle1" fontWeight={700}>
        {children}
      </Typography>
    </Stack>
  );
}

type FindingFormData = Omit<Finding, 'id'>;

interface FindingsModalFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: FindingFormData) => void;
  initialData?: Finding | null;
  loading?: boolean;
}

export default function FindingsModalForm({ open, onClose, onSave, initialData, loading = false }: FindingsModalFormProps) {
  const [formData, setFormData] = useState<FindingFormData>(getInitialFindingData());
  const [touched, setTouched] = useState(getInitialTouchedState());
  const [processes, setProcesses] = useState<ProcessOption[]>([]);
  const [processesLoading, setProcessesLoading] = useState(false);
  const [sources, setSources] = useState<SourceOption[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [auditReports, setAuditReports] = useState<AuditReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [findingTypes, setFindingTypes] = useState<FindingTypeOption[]>([]);
  const [findingTypesLoading, setFindingTypesLoading] = useState(false);

  useEffect(() => {
    if (open) {
      console.log(initialData);
      setFormData(initialData ? { ...initialData } : getInitialFindingData());
      setTouched(getInitialTouchedState());
      
      const loadData = async () => {
        // Load processes
        if (processes.length === 0) {
          setProcessesLoading(true);
          try {
            const processOptions = await getProcesses();
            setProcesses(processOptions);
          } catch (error) {
            console.error('Error loading processes:', error);
          } finally {
            setProcessesLoading(false);
          }
        }
        
        // Load sources
        if (sources.length === 0) {
          setSourcesLoading(true);
          try {
            const sourceOptions = await getSources();
            setSources(sourceOptions);
          } catch (error) {
            console.error('Error loading sources:', error);
          } finally {
            setSourcesLoading(false);
          }
        }
        
        // Load audit reports
        if (auditReports.length === 0) {
          setReportsLoading(true);
          try {
            const reports = await getAuditReports();
            // Filter only active reports
            const activeReports = reports.filter((report: AuditReport) => report.url && report.url !== '');
            setAuditReports(activeReports);
          } catch (error) {
            console.error('Error loading audit reports:', error);
          } finally {
            setReportsLoading(false);
          }
        }

        // Load finding types
        if (findingTypes.length === 0) {
          setFindingTypesLoading(true);
          try {
            const findingTypeOptions = await getFindingTypes();
            setFindingTypes(findingTypeOptions);
          } catch (error) {
            console.error('Error loading finding types:', error);
          } finally {
            setFindingTypesLoading(false);
          }
        }
      };
      
      loadData();
    }
  }, [open, initialData, processes.length, sources.length, auditReports.length, findingTypes.length]);

  const errors = useMemo(() => validateFinding(formData), [formData]);
  const hasErrors = Object.keys(errors).length > 0;

  const markTouched = (name: keyof FindingFormData) => setTouched((prev) => ({ ...prev, [name]: true }));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof FindingFormData]: value }));
  };

  const handleAuditReportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reportId = e.target.value;
    const selectedReport = auditReports.find(r => r.id.toString() === reportId);
    setFormData((prev) => ({ 
      ...prev, 
      auditReportId: reportId,
      auditReportDescription: selectedReport?.desc || selectedReport?.name || ''
    }));
  };

  const handleSave = () => {
    setTouched(Object.keys(touched).reduce((acc, k) => ({ ...acc, [k]: true }), {}) as Record<keyof FindingFormData, boolean>);
    if (hasErrors) return;
    onSave({ ...formData });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: PALETTE.blue,
          color: "#fff",
          py: 1.5,
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <FactCheckRoundedIcon sx={{ fontSize: 22, color: "#fff", opacity: 0.9 }} />
        <Typography component="span" fontWeight={700}>
          {initialData ? "Editar Hallazgo" : "Crear Hallazgo"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: PALETTE.surface, borderTop: `1px solid ${PALETTE.border}` }}>
        <SectionHeader icon={DescriptionRoundedIcon} color={PALETTE.green}>
          Datos del hallazgo
        </SectionHeader>

        <Box
          display="grid"
          gridTemplateColumns="1fr"
          gap={1.5}
          sx={{ mb: 1.5 }}
        >
          <TextField
            select fullWidth size="small" label="Informe de Auditoría *" name="auditReportId"
            value={formData.auditReportId} onChange={handleAuditReportChange}
            onBlur={() => markTouched("auditReportId")}
            error={touched.auditReportId && Boolean(errors.auditReportId)}
            helperText={touched.auditReportId && errors.auditReportId}
            disabled={reportsLoading || loading}
          >
            {auditReports.map((report) => {
              const displayText = report.desc || report.name || 'Sin descripción';
              const truncatedText = displayText.length > 50 
                ? displayText.substring(0, 50) + '...' 
                : displayText;
              return (
                <MenuItem key={report.id} value={report.id.toString()}>
                  {truncatedText}
                </MenuItem>
              );
            })}
          </TextField>
        </Box>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
          gap={1.5}
        >
          <TextField
            select fullWidth size="small" label="Tipo de Hallazgo" name="findingType"
            value={formData.findingType} onChange={handleChange}
            onBlur={() => markTouched("findingType")}
            error={touched.findingType && Boolean(errors.findingType)}
            helperText={touched.findingType && errors.findingType}
            disabled={findingTypesLoading || loading}
          >
            {findingTypes.map((tipo) => (
              <MenuItem key={tipo.id} value={tipo.name}>{tipo.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth size="small" type="date" label="Fecha" name="date"
            value={formData.date} onChange={handleChange}
            onBlur={() => markTouched("date")}
            InputLabelProps={{ shrink: true }}
            error={touched.date && Boolean(errors.date)}
            helperText={touched.date && errors.date}
          />

          <TextField
            select fullWidth size="small" label="Proceso auditado" name="auditedProcess"
            value={formData.auditedProcess} onChange={handleChange}
            onBlur={() => markTouched("auditedProcess")}
            error={touched.auditedProcess && Boolean(errors.auditedProcess)}
            helperText={touched.auditedProcess && errors.auditedProcess}
            disabled={processesLoading || loading}
          >
            {processes.map((process) => (
              <MenuItem key={process.id} value={process.name}>
                {process.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select fullWidth size="small" label="Tipo de auditoría" name="auditType"
            value={formData.auditType} onChange={handleChange}
            onBlur={() => markTouched("auditType")}
            error={touched.auditType && Boolean(errors.auditType)}
            helperText={touched.auditType && errors.auditType}
          >
            {AUDIT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>

          <TextField
            select fullWidth size="small" label="Fuente" name="source"
            value={formData.source} onChange={handleChange}
            onBlur={() => markTouched("source")}
            error={touched.source && Boolean(errors.source)}
            helperText={touched.source && errors.source}
            disabled={sourcesLoading || loading}
          >
            {sources.map((source) => (
              <MenuItem key={source.id} value={source.name}>{source.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth size="small" label="Numeral o requisito legal" name="requirementNumeral"
            placeholder="Ej: Procedimiento información documentada 1.1, Art. 12 (Ley 1712)" inputMode="text"
            value={formData.requirementNumeral} onChange={handleChange}
            onBlur={() => markTouched("requirementNumeral")}
            error={touched.requirementNumeral && Boolean(errors.requirementNumeral)}
            helperText={touched.requirementNumeral && errors.requirementNumeral}
          />
        </Box>

        <SectionHeader icon={RuleRoundedIcon} color={PALETTE.blue}>
          Detalle del hallazgo
        </SectionHeader>

        <Box
          display="grid"
          gridTemplateColumns="1fr"
          gap={1.5}
        >
          <TextField
            fullWidth size="small" multiline minRows={4}
            label="Condición" name="condition"
            value={formData.condition} onChange={handleChange}
            onBlur={() => markTouched("condition")}
            error={touched.condition && Boolean(errors.condition)}
            helperText={touched.condition && errors.condition}
          />

          <TextField
            fullWidth size="small" multiline minRows={4}
            label="Descripción del hallazgo" name="description"
            value={formData.description} onChange={handleChange}
            onBlur={() => markTouched("description")}
            error={touched.description && Boolean(errors.description)}
            helperText={touched.description && errors.description}
          />

          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
            gap={1.5}
          >
            <TextField
              fullWidth size="small" label="Reportado por" placeholder="Nombre del auditor"
              name="reportedBy" value={formData.reportedBy} onChange={handleChange}
              onBlur={() => markTouched("reportedBy")}
              error={touched.reportedBy && Boolean(errors.reportedBy)}
              helperText={touched.reportedBy && errors.reportedBy}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ bgcolor: "#FFFFFF", borderTop: `1px solid ${PALETTE.border}`, py: 1.5, px: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || hasErrors}
          sx={{
            bgcolor: PALETTE.blue,
            "&:hover": { bgcolor: "#0f1c2a" },
          }}
        >
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
