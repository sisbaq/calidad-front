import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "@layouts/DashboardLayout";
import LoginPage from "@pages/authentication/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import CenteredSpinner from "@components/common/CenteredSpinner";
import AuditPlanPage from "@pages/audit/AuditPlanPage";
import AuditFilesPage from "@/pages/audit/AuditFilesPage";
import MissionPage from "@pages/contextOrganization/MissionPage";
import MapProcessPage from "@pages/contextOrganization/MapProcess";
import PolicyPage from "@pages/contextOrganization/PolicyPage";
import PlanesPage from "@/pages/audit/PlanesPage";
import LeadershipCommitment from "@/pages/contextOrganization/LeadershipCommitment";
import RolesResponsabilities from "@pages/contextOrganization/RolesResponsabilities";
import DocumentPage from "@/pages/documents/DocumentPage";
import ApprovalPage from "@/pages/documents/ApprovalPage";
import DocumentsAdminPage from "@/pages/documents/DocumentsAdminPage";
import TransversalDocsPage from "@/pages/documents/TransversalDocsPage";
import MatrixUploadPage from "@/pages/contextOrganization/MatrixUploadPage";
import MatrixViewPage from "@/pages/contextOrganization/MatrixViewPage";
import HomePage from "@/pages/home/Home";
import { IndicatorsModulePage } from "@/pages/indicators/IndicatorsModulePage";
import { IndicatorConfigurationPage } from "@/pages/indicators/IndicatorConfigurationPage";

const FindingsPage = lazy(() => import("@pages/audit/FindingsPage"));
const ManageImprovementPlansPage = lazy(
  () => import("@pages/improvement/ManageImprovementPlansPage"),
);

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      { path: "context/mision-y-vision", element: <MissionPage /> },
      { path: "context/politicas-y-objetivos", element: <PolicyPage /> },
      { path: "context/mapa-procesos", element: <MapProcessPage /> },
      {
        path: "organizacion/liderazgo-y-compromiso",
        element: <LeadershipCommitment />,
      },
      {
        path: "organizacion/roles-y-responsabilidades",
        element: <RolesResponsabilities />,
      },
      {
        path: "organizacion/gestionar-matrices",
        element: <MatrixUploadPage />,
      },
      {
        path: "organizacion/ver-matrices",
        element: <MatrixViewPage />,
      },
      {
        path: "/mejora/plan/auditoria",
        element: <AuditPlanPage />,
      },
      {
        path: "/mejora/ver-planes-auditoria",
        element: <AuditFilesPage />,
      },
      {
        path: "/mejora/no-conformidad",
        element: (
          <Suspense fallback={<CenteredSpinner />}>
            <FindingsPage />
          </Suspense>
        ),
      },
      {
        path: "/mejora/gestionar-hallazgos",
        element: (
          <Suspense fallback={<CenteredSpinner />}>
            <ManageImprovementPlansPage />
          </Suspense>
        ),
      },
      {
        path: "mejora/revisar-planes-auditoria",
        element: (
          <Suspense fallback={<CenteredSpinner />}>
            <PlanesPage />
          </Suspense>
        ),
      },
      {
        path: "crear-documento",
        element: (
          <Suspense fallback={<CenteredSpinner />}>
            <DocumentPage />
          </Suspense>
        ),
      },
      {
        path: "aprobar-documento",
        element: (
          <Suspense fallback={<CenteredSpinner />}>
            <ApprovalPage />
          </Suspense>
        ),
      },
      {
        path: "ver-documentos-transversales",
        element: (
          <Suspense fallback={<CenteredSpinner />}>
            <TransversalDocsPage />
          </Suspense>
        ),
      },
      {
        path: "subir-documentos-transversales",
        element: (
          <Suspense fallback={<CenteredSpinner />}>
            <DocumentsAdminPage />
          </Suspense>
        ),
      },
      {
        path: "indicadores-de-gestion",
        element: (
          <Suspense fallback={<CenteredSpinner />}>
            <IndicatorsModulePage />
          </Suspense>
        ),
      },
      {
        path: "configuracion-indicadores",
        element: (
          <Suspense fallback={<CenteredSpinner />}>
            <IndicatorConfigurationPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <div>404 Not Found</div>,
  },
]);

export default router;
