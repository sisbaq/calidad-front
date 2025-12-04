import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import FindingsModalForm from "@/components/audit/FindingsModalForm";
import FindingsTable from "@/components/audit/FindingsTable";
import FindingsFilters, { type FiltersState } from "@/components/audit/FindingsFilters";
import { 
  getFindings, 
  createFinding, 
  updateFinding, 
  deleteFinding,
  getProcessIdByName,
  getSourceIdByName,
  getAuditTypeIdByName,
  getFindingTypeIdByName,
  getSources,
  getFindingTypes
} from "@services/findings.service";
import type { Finding, SourceOption, FindingTypeOption } from "@/types/audit";

export default function FindingsPage() {
  const [items, setItems] = useState<Finding[]>([]);
  const [sources, setSources] = useState<SourceOption[]>([]);
  const [findingTypes, setFindingTypes] = useState<FindingTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Finding | null>(null);
  const [confirm, setConfirm] = useState({ open: false, item: null as Finding | null });
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'warning' }>({ 
    open: false, 
    msg: '', 
    sev: 'success' 
  });
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState<FiltersState>({
    auditedProcess: "",
    auditType: "",
    findingType: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [findings, sourcesData, findingTypesData] = await Promise.all([
          getFindings(),
          getSources(),
          getFindingTypes(),
        ]);
        setItems(findings);
        setSources(sourcesData);
        setFindingTypes(findingTypesData);
      } catch (error) {
        console.error('Error loading data:', error);
        const msg = error instanceof Error ? error.message : 'Error al cargar los datos';
        setSnack({ open: true, msg, sev: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (item: Finding) => { setEditing(item); setModalOpen(true); };

  const handleSave = async (payload: Omit<Finding, 'id'>) => {
    setSaving(true);
    try {
      // Get the process ID from the selected process name
      const processId = await getProcessIdByName(payload.auditedProcess);
      if (!processId) {
        throw new Error('Proceso no encontrado');
      }

      // Get the source ID from the selected source name
      const sourceId = getSourceIdByName(payload.source, sources);

      // Get audit type ID from the selected audit type name
      const auditTypeId = getAuditTypeIdByName(payload.auditType);
      if (!auditTypeId) {
        throw new Error('Tipo de auditoría no válido');
      }

      // Get finding type ID from the selected finding type name
      const findingTypeId = getFindingTypeIdByName(payload.findingType, findingTypes);
      if (!findingTypeId) {
        throw new Error('Tipo de hallazgo no válido');
      }

      // Get audit report ID from the form
      const auditReportId = parseInt(payload.auditReportId);
      if (!auditReportId || isNaN(auditReportId)) {
        throw new Error('Informe de auditoría no válido');
      }

      if (editing) {
        console.log(payload);
        const updatedFinding = await updateFinding({
          findingId: editing.id,
          finding: payload,
          processId,
          auditTypeId,
          findingTypeId,
          sourceId: sourceId || undefined,
        });
        
        setItems((prev) => prev.map((x) => (x.id === editing.id ? updatedFinding : x)));
        setModalOpen(false);
        setEditing(null);
        setSnack({ open: true, msg: 'Hallazgo actualizado con éxito.', sev: 'success' });
      } else {
        const newFinding = await createFinding({
          finding: payload,
          processId,
          auditReportId,
          auditTypeId,
          findingTypeId,
          sourceId: sourceId || undefined,
        });
        
        setItems((prev) => [newFinding, ...prev]);
        setModalOpen(false);
        setEditing(null);
        setSnack({ open: true, msg: 'Hallazgo guardado con éxito.', sev: 'success' });
      }
    } catch (error) {
      console.error('Error saving finding:', error);
      const msg = error instanceof Error ? error.message : 'Error al guardar el hallazgo';
      setSnack({ open: true, msg, sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (item: Finding) => setConfirm({ open: true, item });
  const cancelDelete = () => setConfirm({ open: false, item: null });
  const doDelete = async () => {
    if (!confirm.item) return;
    
    try {
      await deleteFinding(confirm.item.id);
      setItems((prev) => prev.filter((x) => x.id !== confirm.item!.id));
      setConfirm({ open: false, item: null });
      setSnack({ open: true, msg: 'Hallazgo eliminado con éxito.', sev: 'success' });
    } catch (error) {
      console.error('Error deleting finding:', error);
      const msg = error instanceof Error ? error.message : 'Error al eliminar el hallazgo';
      setSnack({ open: true, msg, sev: 'error' });
      setConfirm({ open: false, item: null });
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name as keyof FiltersState]: value }));
  };

  const filteredItems = useMemo(
    () =>
      items.filter(
        (it) =>
          (!filters.auditedProcess || it.auditedProcess === filters.auditedProcess) &&
          (!filters.auditType || it.auditType === filters.auditType) &&
          (!filters.findingType || it.findingType === filters.findingType)
      ),
    [items, filters]
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">Hallazgos</Typography>
        <Button variant="contained" onClick={openCreate} disabled={saving}>
          Crear hallazgo
        </Button>
      </Stack>

      <Stack spacing={2}>
        <FindingsFilters filters={filters} onChange={handleFilterChange} findingTypes={findingTypes} />
        <FindingsTable items={filteredItems} onEdit={openEdit} onDelete={askDelete} />
      </Stack>

      <FindingsModalForm
        open={modalOpen}
        onClose={() => { 
          if (!saving) {
            setModalOpen(false); 
            setEditing(null); 
          }
        }}
        onSave={handleSave}
        initialData={editing}
        loading={saving}
      />

      <Dialog open={confirm.open} onClose={cancelDelete}>
        <DialogTitle>Eliminar hallazgo</DialogTitle>
        <DialogContent>¿Seguro que deseas eliminar este hallazgo?</DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancelar</Button>
          <Button onClick={doDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.sev}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
