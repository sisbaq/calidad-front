import { useState } from 'react';
import type { FC } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import { appColors } from '@/theme/colors';

import type { Indicator, PeriodRow } from '../../types/indicators';
import { IndicatorForm } from '../../components/indicators/IndicatorForm';
import { IndicatorList } from '../../components/indicators/IndicatorList';
import { IndicatorManageDialog } from '../../components/indicators/IndicatorManageDialog';

export const IndicatorsModulePage: FC = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editingIndicator, setEditingIndicator] =
    useState<Indicator | null>(null);

  const [manageOpen, setManageOpen] = useState<boolean>(false);
  const [selectedIndicator, setSelectedIndicator] =
    useState<Indicator | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState<boolean>(false);
  const [indicatorToDelete, setIndicatorToDelete] =
    useState<Indicator | null>(null);

  const handleToggleForm = () => {
    setFormOpen((prev) => !prev);
    if (formOpen) {
      setEditingIndicator(null);
    }
  };

  const handleSubmitIndicator = (indicator: Indicator) => {
    if (editingIndicator) {
      setIndicators((prev) =>
        prev.map((item) =>
          item.id === indicator.id
            ? { ...indicator, hasData: item.hasData }
            : item,
        ),
      );
    } else {
      setIndicators((prev) => [
        ...prev,
        { ...indicator, hasData: false },
      ]);
    }

    setEditingIndicator(null);
    setFormOpen(false);
  };

  const handleEditIndicator = (indicator: Indicator) => {
    if (indicator.hasData) return;
    setEditingIndicator(indicator);
    if (!formOpen) setFormOpen(true);
  };


  const handleDeleteIndicator = (indicator: Indicator) => {
    if (indicator.hasData) return;
    setIndicatorToDelete(indicator);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!indicatorToDelete) {
      setDeleteDialogOpen(false);
      return;
    }

    if (indicatorToDelete.hasData) {
      setDeleteDialogOpen(false);
      setIndicatorToDelete(null);
      return;
    }

    setIndicators((prev) =>
      prev.filter((i) => i.id !== indicatorToDelete.id),
    );
    setDeleteDialogOpen(false);
    setIndicatorToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setIndicatorToDelete(null);
  };

  const handleOpenManage = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setManageOpen(true);
  };

  const handleCloseManage = () => {
    setManageOpen(false);
    setSelectedIndicator(null);
  };

  const handleSaveManage = (rows: PeriodRow[]) => {
    void rows;

    if (!selectedIndicator) return;

    setIndicators((prev) =>
      prev.map((ind) =>
        ind.id === selectedIndicator.id
          ? { ...ind, hasData: true }
          : ind,
      ),
    );

    setManageOpen(false);
    setSelectedIndicator(null);
  };

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
            Crea y administra los indicadores de calidad de tu
            organización.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={formOpen ? <CloseIcon /> : <AddIcon />}
          sx={{
            textTransform: 'none',
            backgroundColor: appColors.blue,
            '&:hover': {
              backgroundColor: appColors.blue,
              opacity: 0.9,
            },
          }}
          onClick={handleToggleForm}
        >
          {formOpen ? 'Cerrar formulario' : 'Nuevo indicador'}
        </Button>
      </Box>
      {formOpen && (
        <Box sx={{ mb: 3 }}>
          <IndicatorForm
            onSubmit={handleSubmitIndicator}
            initialIndicator={editingIndicator}
          />
        </Box>
      )}
      <IndicatorList
        indicators={indicators}
        onManage={handleOpenManage}
        onEdit={handleEditIndicator}
        onDelete={handleDeleteIndicator}
      />
      <IndicatorManageDialog
        open={manageOpen}
        indicator={selectedIndicator}
        onClose={handleCloseManage}
        onSave={handleSaveManage}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Eliminar indicador</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 1 }}>
            ¿Estás seguro de que deseas eliminar el indicador{' '}
            <strong>{indicatorToDelete?.name}</strong>? Esta acción no
            se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
