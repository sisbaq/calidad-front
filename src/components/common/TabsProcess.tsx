import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";

const PALETTE = { blue: "#142334", green: "#279B48" };

type CustomTabPanelProps = {
  children?: React.ReactNode;
  value: number;
  index: number;
} & React.HTMLAttributes<HTMLDivElement>;

function CustomTabPanel({ children, value, index, ...other }: CustomTabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1, md: 3 } }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return { id: `simple-tab-${index}`, "aria-controls": `simple-tabpanel-${index}` };
}

type Proceso = { nombre: string; pdf: string };

const procesosEstrategicos: Proceso[] = [
  { nombre: "Direccionamiento Estratégico y Planeación", pdf: "/pdf/Direccionamiento Estratégico y Planeación.pdf" },
  { nombre: "Gestión de las Tecnologías e Información", pdf: "/pdf/Gestión de las tecnologias.pdf" },
  { nombre: "Gestión de Recursos Financieros", pdf: "/pdf/Gestión de Recursos Financieros.pdf" },
  { nombre: "Gestión de la Comunicación", pdf: "/pdf/Gestión de la Comunicación.pdf" },
];

const procesosEvaluacion: Proceso[] = [
  { nombre: "Gestión Disciplinaria", pdf: "/pdf/Gestión Disciplinaria.pdf" },
  { nombre: "Evaluación Independiente", pdf: "/pdf/Evaluación Independiente.pdf" },
];

const procesosApoyo: Proceso[] = [
  { nombre: "Gestión Humana y SST", pdf: "/pdf/Gestión Humana y SST.pdf" },
  { nombre: "Gestión Jurídica", pdf: "/pdf/Gestion Jurídica.pdf" },
  { nombre: "Gestión de la Contratación", pdf: "/pdf/Gestión de la Contratación.pdf" },
  { nombre: "Gestión de la Infraestructura Fisica", pdf: "/pdf/Gestión de la Infraestructura Física.pdf" },
  { nombre: "Gestión Documental", pdf: "/pdf/Gestión Documental.pdf" },
];

const procesosMisionales: Proceso[] = [
  { nombre: "Gestión de la Salud", pdf: "/pdf/Gestión de la Salud.pdf" },
  { nombre: "Gestión del Servicio Educativo", pdf: "/pdf/Gestión del Servicio Educativo.pdf" },
  { nombre: "Gestión de Recreación y Deportes", pdf: "/pdf/Gestión de Recreación y Deportes.pdf" },
  { nombre: "Gestión Cultural y Patrimonio", pdf: "/pdf/Gestión Cultural y Patrimonio.pdf" },
  { nombre: "Gestión y Desarrollo Social", pdf: "/pdf/Gestión y Desarrollo Social.pdf" },
  { nombre: "Ordenamiento y Desarrollo Físico", pdf: "/pdf/Ordenamiento y Desarrollo Físico.pdf" },
  { nombre: "Gestión del Diseño y Control de Obras", pdf: "/pdf/Gestión del Diseño y control de obras.pdf" },
  { nombre: "Gestión del Tránsito y Seguridad Vial", pdf: "/pdf/Gestión del Tránsito y Seguridad Vial.pdf" },
  { nombre: "Hábitat", pdf: "/pdf/Hábitat.pdf" },
  { nombre: "Gestión de la Seguridad", pdf: "/pdf/Gestión de la Seguridad.pdf" },
  { nombre: "Fortalecimiento a la Justicia", pdf: "/pdf/Fortalecimiento a la justicia.pdf" },
  { nombre: "Gestión del Riesgo de Emergencias y Desastres", pdf: "/pdf/Gestión del Riesgo de emergencia y desastre.pdf" },
  { nombre: "Gestión del Turismo", pdf: "/pdf/Gestión del Turismo.pdf" },
  { nombre: "Gestión del Desarrollo Económico", pdf: "/pdf/Gestión del Desarrollo Económico.pdf" },
  { nombre: "Atención al Ciudadano", pdf: "/pdf/Atención al Ciudadano.pdf" },
  { nombre: "Participación Ciudadana", pdf: "/pdf/Participación Ciudadana.pdf" },
];

export type TabsProcessProps = {
  collapsed?: boolean;
};

export default function TabsProcess({ collapsed = false }: TabsProcessProps) {
  const [value, setValue] = useState<number>(0);
  const handleChange = (_e: React.SyntheticEvent, newValue: number) => setValue(newValue);
  const openPDF = (url: string) => window.open(encodeURI(url), "_blank");

  const tableSx = {
    "& thead th": { bgcolor: PALETTE.blue, color: "#fff", fontWeight: 700 },
    "& tbody tr:hover": { backgroundColor: `${PALETTE.green}0D` },
    "& tbody td": { py: 1.25 },
  } as const;

  const renderRows = (rows: Proceso[]) =>
    rows.map((p, idx) => (
      <TableRow key={p.nombre} hover>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircleIcon
              fontSize="small"
              sx={{ color: idx % 2 === 0 ? PALETTE.blue : PALETTE.green }}
            />
            {p.nombre}
          </Box>
        </TableCell>
        <TableCell width={160} align="right">
          <Button
            variant="contained"
            onClick={() => openPDF(p.pdf)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: PALETTE.blue,
              "&:hover": { bgcolor: PALETTE.green },
            }}
          >
            Ver PDF
          </Button>
        </TableCell>
      </TableRow>
    ));

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: `${PALETTE.blue}33`, px: 1 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="tabs procesos"
          textColor="inherit"
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 700, color: PALETTE.blue },
            "& .Mui-selected": { color: PALETTE.green },
            "& .MuiTabs-indicator": { backgroundColor: PALETTE.green, height: 3, borderRadius: 2 },
          }}
        >
          <Tab label="Procesos Estratégicos" {...a11yProps(0)} />
          <Tab label="Procesos Evaluación" {...a11yProps(1)} />
          <Tab label="Procesos Apoyo" {...a11yProps(2)} />
          <Tab label="Procesos Misionales" {...a11yProps(3)} />
        </Tabs>
      </Box>

      {!collapsed && (
        <>
          <CustomTabPanel value={value} index={0}>
            <TableContainer component={Paper} sx={{ boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
              <Table sx={tableSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>Proceso</TableCell>
                    <TableCell align="right">Documento</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{renderRows(procesosEstrategicos)}</TableBody>
              </Table>
            </TableContainer>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={1}>
            <TableContainer component={Paper} sx={{ boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
              <Table sx={tableSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>Proceso</TableCell>
                    <TableCell align="right">Documento</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{renderRows(procesosEvaluacion)}</TableBody>
              </Table>
            </TableContainer>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={2}>
            <TableContainer component={Paper} sx={{ boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
              <Table sx={tableSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>Proceso</TableCell>
                    <TableCell align="right">Documento</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{renderRows(procesosApoyo)}</TableBody>
              </Table>
            </TableContainer>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={3}>
            <TableContainer component={Paper} sx={{ boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
              <Table sx={tableSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>Proceso</TableCell>
                    <TableCell align="right">Documento</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{renderRows(procesosMisionales)}</TableBody>
              </Table>
            </TableContainer>
          </CustomTabPanel>
        </>
      )}
    </Box>
  );
}
