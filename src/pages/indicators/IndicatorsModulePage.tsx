import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { appColors } from '@/theme/colors';

import type {
  Indicator,
  PeriodRow,
  IndicatorPeriodRow,
} from '../../types/indicators';

import { IndicatorForm } from '../../components/indicators/IndicatorForm';
import { IndicatorManageDialog } from '../../components/indicators/IndicatorManageDialog';
import { IndicatorViewModal } from '../../components/indicators/IndicatorViewModal';
import { IndicatorTable } from '../../components/indicators/IndicatorTable';
import { createId } from '../../types/indicators';
import { useAuth } from '@/hooks/useAuth';

export const IndicatorsModulePage: React.FC = () => {
  const { session } = useAuth();

  const userRole = session?.user?.role || 'Agente de cambio';
  const isAdmin = userRole === 'Administrador';
  const userId = session?.user?.id;

  const mockIndicators: Indicator[] = [
    {
      id: '1',
      name: 'Eficiencia en procesos de gestión',
      formula: 'procesos_completados / procesos_totales * 100',
      unit: 'Porcentaje',
      annualTarget: 95,
      periodicity: 'MENSUAL',
      trend: 'ASC',
      realValue: 87.5,
      responsible: 'Coordinador de Calidad',
      process: 'Gestión de Calidad',
      hasData: true,
      lastUpdate: '2024-11-15T10:30:00Z',
      userId: 1,
      variables: [
        { id: 'v1', key: 'procesos_completados', label: 'Procesos completados en el período', description: 'Número de procesos finalizados satisfactoriamente' },
        { id: 'v2', key: 'procesos_totales', label: 'Total de procesos', description: 'Número total de procesos iniciados' },
      ],
    },
    {
      id: '2',
      name: 'Satisfacción del cliente',
      formula: 'clientes_satisfechos / total_encuestas * 100',
      unit: 'Porcentaje',
      annualTarget: 90,
      periodicity: 'TRIMESTRAL',
      trend: 'ASC',
      realValue: 92.3,
      responsible: 'Jefe de Atención al Cliente',
      process: 'Servicio al Cliente',
      hasData: false,
      lastUpdate: undefined,
      userId: 2,
      variables: [
        { id: 'v3', key: 'clientes_satisfechos', label: 'Clientes satisfechos', description: 'Clientes que calificaron con 4 o 5 estrellas' },
        { id: 'v4', key: 'total_encuestas', label: 'Total de encuestas', description: 'Número total de encuestas respondidas' },
      ],
    },
    {
      id: '3',
      name: 'Cumplimiento de auditorías',
      formula: 'auditorias_aprobadas / auditorias_realizadas * 100',
      unit: 'Porcentaje',
      annualTarget: 100,
      periodicity: 'BIMESTRAL',
      trend: 'ASC',
      realValue: 88.0,
      responsible: 'Auditor Interno',
      process: 'Auditoría Interna',
      hasData: true,
      lastUpdate: '2024-12-01T14:20:00Z',
      userId: 3,
      variables: [
        { id: 'v5', key: 'auditorias_aprobadas', label: 'Auditorías aprobadas', description: 'Auditorías sin hallazgos críticos' },
        { id: 'v6', key: 'auditorias_realizadas', label: 'Auditorías realizadas', description: 'Total de auditorías ejecutadas' },
      ],
    },
    {
      id: '4',
      name: 'Tiempo de respuesta a solicitudes',
      formula: 'solicitudes_a_tiempo / total_solicitudes * 100',
      unit: 'Porcentaje',
      annualTarget: 85,
      periodicity: 'MENSUAL',
      trend: 'ASC',
      realValue: 78.5,
      responsible: 'Coordinador de Mesa de Ayuda',
      process: 'Soporte Técnico',
      hasData: true,
      lastUpdate: '2024-11-28T09:15:00Z',
      userId: 1,
      variables: [
        { id: 'v7', key: 'solicitudes_a_tiempo', label: 'Solicitudes atendidas a tiempo', description: 'Solicitudes resueltas dentro del SLA' },
        { id: 'v8', key: 'total_solicitudes', label: 'Total de solicitudes', description: 'Todas las solicitudes recibidas' },
      ],
    },
    {
      id: '5',
      name: 'Capacitación del personal',
      formula: 'empleados_capacitados / total_empleados * 100',
      unit: 'Porcentaje',
      annualTarget: 80,
      periodicity: 'SEMESTRAL',
      trend: 'ASC',
      realValue: 65.0,
      responsible: 'Gerente de Recursos Humanos',
      process: 'Recursos Humanos',
      hasData: false,
      lastUpdate: undefined,
      userId: 4,
      variables: [
        { id: 'v9', key: 'empleados_capacitados', label: 'Empleados capacitados', description: 'Empleados que completaron al menos un curso' },
        { id: 'v10', key: 'total_empleados', label: 'Total de empleados', description: 'Número total de empleados activos' },
      ],
    },
  ];

  const [indicators, setIndicators] = useState<Indicator[]>(mockIndicators);
  const [formOpen, setFormOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);

  const [manageOpen, setManageOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewIndicator, setViewIndicator] = useState<Indicator | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [indicatorToDelete, setIndicatorToDelete] = useState<Indicator | null>(null);

  const handleToggleForm = () => {
    setFormOpen((p) => !p);
    if (formOpen) setEditingIndicator(null);
  };

  const handleCreateOrUpdate = (indicator: Indicator) => {
    if (editingIndicator) {
      setIndicators((prev) =>
        prev.map((it) =>
          it.id === indicator.id
            ? { ...indicator, hasData: it.hasData, lastUpdate: it.lastUpdate }
            : it,
        ),
      );
    } else {
      const newIndicator: Indicator = {
        ...indicator,
        id: indicator.id ?? createId(),
        hasData: false,
        lastUpdate: undefined,
        userId: userId,
        process: session?.user?.department || 'Proceso General',
      };
      setIndicators((prev) => [...prev, newIndicator]);
    }
    setEditingIndicator(null);
    setFormOpen(false);
  };

  const handleEdit = (indicator: Indicator) => {
    if (indicator.hasData) return;
    setEditingIndicator(indicator);
    setFormOpen(true);
  };

  const handleRequestDelete = (indicator: Indicator) => {
    if (indicator.hasData) return;
    setIndicatorToDelete(indicator);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!indicatorToDelete) {
      setDeleteDialogOpen(false);
      return;
    }
    setIndicators((prev) =>
      prev.filter((i) => i.id !== indicatorToDelete.id),
    );
    setIndicatorToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleManage = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setManageOpen(true);
  };

  const handleView = (indicator: Indicator) => {
    setViewIndicator(indicator);
    setViewOpen(true);
  };

  // ✅ CORREGIDO
  const handleSaveManage = (rows: IndicatorPeriodRow[]) => {
    void rows;

    if (!selectedIndicator) return;

    // 🔁 Si luego necesitas enviar al backend:
    const mappedRows: PeriodRow[] = rows.map((r) => ({
      id: String(r.index),
      periodLabel: r.label,
      value: r.result ?? 0,
    }));


    void mappedRows;

    const nowIso = new Date().toISOString();
    setIndicators((prev) =>
      prev.map((i) =>
        i.id === selectedIndicator.id
          ? { ...i, hasData: true, lastUpdate: nowIso }
          : i,
      ),
    );

    setManageOpen(false);
    setSelectedIndicator(null);
  };

  const filteredIndicators = isAdmin
    ? indicators
    : indicators.filter((ind) => ind.userId === userId);

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: appColors.blue }}
          >
            Gestión de Indicadores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdmin
              ? 'Visualiza y consulta todos los indicadores de la organización.'
              : 'Crea y administra los indicadores de calidad de tu organización.'}
          </Typography>
        </Box>

        {!isAdmin && (
          <Button
            variant="contained"
            startIcon={formOpen ? <CloseIcon /> : <AddIcon />}
            sx={{ textTransform: 'none', backgroundColor: appColors.blue }}
            onClick={handleToggleForm}
          >
            {formOpen ? 'Cerrar formulario' : 'Nuevo indicador'}
          </Button>
        )}
      </Box>

      {!isAdmin && formOpen && (
        <Box sx={{ mb: 3 }}>
          <IndicatorForm
            onSubmit={handleCreateOrUpdate}
            initialIndicator={editingIndicator}
          />
        </Box>
      )}

      <IndicatorTable
        indicators={filteredIndicators}
        role={isAdmin ? 'ADMIN' : 'GESTOR'}
        onManage={handleManage}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleRequestDelete}
      />

      <IndicatorManageDialog
        open={manageOpen}
        indicator={selectedIndicator}
        onClose={() => setManageOpen(false)}
        onSave={handleSaveManage}
      />

      <IndicatorViewModal
        open={viewOpen}
        indicator={viewIndicator}
        onClose={() => setViewOpen(false)}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Eliminar indicador</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de eliminar{' '}
            <strong>{indicatorToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
