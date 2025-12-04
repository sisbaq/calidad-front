import { useEffect, useState } from "react";
import { Box, MenuItem, Paper, TextField, Typography } from "@mui/material";
import {
  AUDIT_TYPES,
} from "@constants/findings.constants";
import { getProcesses } from "@/services/findings.service";
import type { ProcessOption, FindingTypeOption } from "@/types/audit";

export interface FiltersState {
  auditedProcess: string;
  auditType: string;
  findingType: string;
}

interface FindingsFiltersProps {
  filters: FiltersState;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tiposAuditoria?: string[];
  findingTypes?: FindingTypeOption[];
}

export default function FindingsFilters({
  filters,
  onChange,
  tiposAuditoria = AUDIT_TYPES,
  findingTypes = [],
}: FindingsFiltersProps) {
  const [processes, setProcesses] = useState<ProcessOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProcesses = async () => {
      try {
        const processOptions = await getProcesses();
        setProcesses(processOptions);
      } catch (error) {
        console.error('Error loading processes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProcesses();
  }, []);
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Filtros
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, 1fr)" }}
        gap={1.5}
      >
        <TextField
          select
          fullWidth
          size="small"
          label="Proceso"
          name="auditedProcess"
          value={filters.auditedProcess}
          onChange={onChange}
          disabled={loading}
        >
          <MenuItem value="">Todos</MenuItem>
          {processes.map((process) => (
            <MenuItem key={process.id} value={process.name}>
              {process.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          size="small"
          label="Tipo de auditoría"
          name="auditType"
          value={filters.auditType}
          onChange={onChange}
        >
          <MenuItem value="">Todos</MenuItem>
          {tiposAuditoria.map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          size="small"
          label="Tipo de hallazgo"
          name="findingType"
          value={filters.findingType}
          onChange={onChange}
        >
          <MenuItem value="">Todos</MenuItem>
          {findingTypes.map((t) => (
            <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>
          ))}
        </TextField>
      </Box>
    </Paper>
  );
}
