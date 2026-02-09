import type { ReactNode } from "react";
import { useAuth } from "@hooks/useAuth";

import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MapIcon from "@mui/icons-material/Map";
import PolicyIcon from "@mui/icons-material/Policy";
// import EmergencyIcon from '@mui/icons-material/Emergency';
// import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
// import BusinessIcon from '@mui/icons-material/Business';
// import WorkIcon from '@mui/icons-material/Work';
// import LogoutIcon from '@mui/icons-material/Logout';
// import AssessmentIcon from "@mui/icons-material/Assessment";
import AnalyticsIcon from "@mui/icons-material/Analytics";
// import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";
import FormatIndentIncreaseIcon from "@mui/icons-material/FormatIndentIncrease";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CrisisAlertIcon from "@mui/icons-material/CrisisAlert";
import CreateIcon from "@mui/icons-material/Create";
// import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import AssignmentIcon from "@mui/icons-material/Assignment";
// import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import GroupIcon from "@mui/icons-material/Group";
// import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FortIcon from "@mui/icons-material/Fort";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
// import DesignServicesIcon from '@mui/icons-material/DesignServices';
import FindInPageIcon from "@mui/icons-material/FindInPage";
import RateReviewIcon from "@mui/icons-material/RateReview";
// import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import ApprovalIcon from "@mui/icons-material/Approval";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsIcon from '@mui/icons-material/Settings';
import ChecklistIcon from '@mui/icons-material/Checklist';
export interface NavItem {
  title: string;
  icon?: ReactNode;
  segment?: string;
  rolesAllowed?: string[];
  children?: NavItem[];
  kind?: "header";
}

const ROLES = {
  ADMIN: "Administrador",
  GESTOR: "Agente de cambio",
  AUDITOR: "Auditor",
};

const ALL_ROUTES: NavItem[] = [
  {
    kind: "header",
    title: "SOBRE LA ORGANIZACIÓN",
    rolesAllowed: [ROLES.ADMIN, ROLES.GESTOR, ROLES.AUDITOR],
  },
  {
    title: "Plataforma estratégica",
    icon: <FortIcon />,
    segment: "context",
    rolesAllowed: [ROLES.ADMIN, ROLES.GESTOR, ROLES.AUDITOR],
    children: [
      {
        segment: "mision-y-vision",
        title: "Misión y Visión",
        icon: <PolicyIcon />,
      },
      {
        segment: "politicas-y-objetivos",
        title: "Nuestras Políticas",
        icon: <AssignmentIcon />,
      },
      {
        segment: "mapa-procesos",
        title: "Mapa de procesos",
        icon: <MapIcon />,
      },
    ],
  },
  {
    title: "Contexto de la organización",
    icon: <AccountBalanceIcon />,
    segment: "organizacion",
    rolesAllowed: [ROLES.ADMIN, ROLES.GESTOR, ROLES.AUDITOR],
    children: [
      {
        segment: "gestionar-matrices",
        title: "Gestionar matrices",
        icon: <UploadIcon />,
        rolesAllowed: [ROLES.ADMIN],
      },
      {
        segment: "ver-matrices",
        title: "Ver matrices",
        icon: <DownloadIcon />,
        rolesAllowed: [ROLES.GESTOR],
      },
      {
        segment: "liderazgo-y-compromiso",
        title: "Liderazgo y compromiso",
        icon: <EmojiPeopleIcon />,
      },
      {
        segment: "roles-y-responsabilidades",
        title: "Roles y responsabilidades",
        icon: <GroupIcon />,
      },
    ],
  },
  // {
  //   kind: "header",
  //   title: "PLANIFICACIÓN",
  //   rolesAllowed: [ROLES.ADMIN, ROLES.GESTOR],
  // },
  // {
  //   title: "Planificación",
  //   icon: <BusinessIcon />,
  //   segment: "planificacion",
  //   rolesAllowed: [ROLES.ADMIN, ROLES.GESTOR],
  //   // children: [
  //   //   { segment: 'riesgos', title: 'Riesgos', icon: <EmergencyIcon />, },
  //   //   { segment: 'oportunidades', title: 'Oportunidades', icon: <AutoStoriesIcon />, },
  //   //   { segment: 'planificacion-de-cambios', title: 'Planificación de Cambios', icon: <ChangeCircleIcon />, },
  //   // ],
  // },
  {
    kind: "header",
    title: "DOCUMENTACIÓN",
    rolesAllowed: [ROLES.ADMIN, ROLES.GESTOR],
    children: [
      {
        title: "Crear documentación",
        icon: <CreateIcon />,
        segment: "crear-documento",
        rolesAllowed: [ROLES.ADMIN, ROLES.GESTOR],
      },
    ],
  },
  {
    title: "Crear documentación",
    icon: <CreateIcon />,
    segment: "crear-documento",
    rolesAllowed: [ROLES.GESTOR],
  },
  {
    title: "Aprobar documentación",
    icon: <ApprovalIcon />,
    segment: "aprobar-documento",
    rolesAllowed: [ROLES.ADMIN],
  },
  {
    title: "Subir documentos consulta",
    icon: <FileUploadIcon />,
    segment: "subir-documentos-transversales",
    rolesAllowed: [ROLES.ADMIN],
  },
  {
    title: "Ver Documentos de consulta",
    icon: <LibraryBooksIcon />,
    segment: "ver-documentos-transversales",
    rolesAllowed: [ROLES.GESTOR],
  },
  // {
  //   kind: "header",
  //   title: "OPERACIÓN",
  //   rolesAllowed: [ROLES.ADMIN, ROLES.GESTOR],
  // },
  // {
  //   title: "Operación",
  //   icon: <WorkIcon />,
  //   segment: "operacion",
  //   rolesAllowed: [ROLES.ADMIN, ROLES.GESTOR],
  //   // children: [
  //   //   { segment: 'salidas-no-conformidades', title: 'Control de salidas NC', icon: <LogoutIcon />, },
  //   //   { segment: 'diseno-desarrollo-productos-y-servicios', title: 'Diseño y desarrollo de productos/servicios', icon: <DesignServicesIcon />, },
  //   // ],
  // },
  // {
  //   kind: "header",
  //   title: "EVALUACIÓN",
  // },

  {
    kind: "header",
    title: "OPERACIÓN",
    rolesAllowed: [ROLES.ADMIN, ROLES.GESTOR],
  },
   {
    title: "Acción de autocontrol",
    icon: <ChecklistIcon />,
    segment: "acción-de-autocontrol",
    rolesAllowed: [ROLES.ADMIN, ROLES.GESTOR],
  },
    {
    title: "Indicadores de gestión",
    icon: <AnalyticsIcon />,
    segment: "indicadores-de-gestion",
    rolesAllowed: [ROLES.ADMIN, ROLES.GESTOR],
  },
  {
    title: "Configurar indicadores",
    icon: <SettingsIcon />,
    segment: "configuracion-indicadores",
    rolesAllowed: [ROLES.ADMIN],
  },
  {
    kind: "header",
    title: "AUDITORÍA",
  },
  {
    title: "Mejora",
    icon: <AutorenewIcon />,
    segment: "mejora",
    rolesAllowed: [ROLES.AUDITOR, ROLES.GESTOR, ROLES.ADMIN],
    children: [
      {
        segment: "plan/auditoria",
        title: "Planes de auditoria",
        icon: <ContentPasteSearchIcon />,
        rolesAllowed: [ROLES.ADMIN, ROLES.AUDITOR],
      },
      {
        segment: "ver-planes-auditoria",
        title: "Ver planes",
        icon: <FindInPageIcon />,
        rolesAllowed: [ROLES.ADMIN, ROLES.GESTOR],
      },
      // {
      //   segment: "administrar-planes-auditoria",
      //   title: "Administrar planes",
      //   icon: <ManageSearchIcon />,
      //   rolesAllowed: [ROLES.ADMIN],
      // },
      {
        segment: "no-conformidad",
        title: "Crear Hallazgos",
        icon: <CrisisAlertIcon />,
        rolesAllowed: [ROLES.AUDITOR, ROLES.ADMIN],
      },
      {
        segment: "gestionar-hallazgos",
        title: "Gestionar hallazgos",
        icon: <FormatIndentIncreaseIcon />,
        rolesAllowed: [ROLES.GESTOR],
      },
      {
        segment: "revisar-planes-auditoria",
        title: "Revisar planes",
        icon: <RateReviewIcon />,
        rolesAllowed: [ROLES.AUDITOR, ROLES.ADMIN],
      },
    ],
  },
  {
    kind: "header",
    title: "Administrador",
    rolesAllowed: ["administrador"],
  },
  {
    segment: "users",
    title: "Usuarios",
    icon: <PeopleAltIcon />,
    rolesAllowed: ["administrador"],
  },
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
    segment: "",
    rolesAllowed: ["administrador"],
  },
];

export function useFilteredNavigation(): NavItem[] {
  const { session } = useAuth();

  if (!session?.user?.role) {
    return [];
  }

  const userRol = session.user.role;

  const filterRoutes = (routes: NavItem[]): NavItem[] => {
    return routes.reduce((acc: NavItem[], route) => {
      // If no roles specified, allow access; otherwise check if user's role is included
      const hasAccess =
        !route.rolesAllowed || route.rolesAllowed.includes(userRol);

      if (hasAccess) {
        const newRoute = { ...route };
        if (route.children) {
          newRoute.children = filterRoutes(route.children);
          if (newRoute.children.length > 0) {
            acc.push(newRoute);
          }
        } else {
          acc.push(newRoute);
        }
      }
      return acc;
    }, []);
  };

  return filterRoutes(ALL_ROUTES);
}
