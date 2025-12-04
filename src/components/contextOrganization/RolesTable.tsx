import * as React from "react";
import {
  Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Box, alpha, Collapse, IconButton
} from "@mui/material";
import AssignmentIndOutlined from "@mui/icons-material/AssignmentIndOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import { BRAND, type Role } from "@constants/roles.constants";

type ExpandMoreProps = {
  expand?: boolean;
} & React.ComponentProps<typeof IconButton>;

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
}, { shouldForwardProp: (prop) => prop !== "expand" })(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  transition: theme.transitions.create("transform", { duration: theme.transitions.duration.shortest }),
  color: BRAND.blue,
}));

export interface RolesTableProps {
  rows: Role[];
}

export default function RolesTable({ rows }: RolesTableProps) {
  const [open, setOpen] = React.useState(false); 

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(BRAND.blue, 0.12)}` }}>
      <Box
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3, py: 2,
          borderBottom: `1px solid ${alpha(BRAND.blue, 0.1)}`,
          background: alpha(BRAND.blue, 0.04),
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          cursor: "pointer",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <AssignmentIndOutlined sx={{ color: BRAND.green }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND.blue }}>
            Responsables de Procesos
          </Typography>
        </Box>

        <ExpandMore
          aria-label={open ? "Contraer tabla" : "Expandir tabla"}
          expand={open}
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="medium" aria-label="responsables-procesos">
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: BRAND.blue,
                    "& th": { color: "#fff", fontWeight: 700, borderColor: alpha("#fff", 0.2) },
                  }}
                >
                  <TableCell>Nombre del Proceso</TableCell>
                  <TableCell width={360}>Responsable o Dueño del Proceso</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow key={idx} hover sx={{ "& td": { borderColor: alpha(BRAND.blue, 0.06) } }}>
                    <TableCell>
                      <Typography sx={{ color: BRAND.blue, fontWeight: 500 }}>{r.proceso}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: alpha(BRAND.blue, 0.9) }}>{r.responsable}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Collapse>
    </Card>
  );
}