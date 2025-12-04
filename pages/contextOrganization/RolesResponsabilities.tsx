import { Box, Card, CardContent, Typography, Divider, alpha } from "@mui/material";
import RolesTable from "@components/contextOrganization/RolesTable";
import { ROLES, BRAND } from "@constants/roles.constants";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";


export default function RolesPage() {
  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, bgcolor: alpha(BRAND.blue, 0.02) }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <GroupsOutlined sx={{ fontSize: 44, color: BRAND.blue }} />
        <Typography variant="h4" sx={{ fontWeight: 800, color: BRAND.blue, mt: 1 }}>
          Información de Roles
        </Typography>
        <Box sx={{ height: 4, width: 96, mx: "auto", mt: 1, borderRadius: 8, bgcolor: BRAND.green }} />
      </Box>

      <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: `1px solid ${alpha(BRAND.blue, 0.12)}` }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <InfoOutlined sx={{ color: BRAND.green }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: BRAND.blue }}>
              Descripción de Responsabilidades
            </Typography>
          </Box>
          <Typography sx={{ color: alpha(BRAND.blue, 0.9), lineHeight: 1.7 }}>
            Como responsables o dueños de los procesos se designan las dependencias líderes de cada proceso.
            Deben promover la participación, asegurar el conocimiento de funciones y autoridad, y coordinar
            la ejecución con las áreas competentes. Informan a la alta dirección sobre el desempeño y actúan
            como enlace para la integración de los equipos de mejoramiento continuo, garantizando comunicación,
            participación, calidad y servicio.
          </Typography>
        </CardContent>
      </Card>

      <RolesTable rows={ROLES} />
      <Divider sx={{ my: 4, borderColor: alpha(BRAND.blue, 0.06) }} />
    </Box>
  );
}
