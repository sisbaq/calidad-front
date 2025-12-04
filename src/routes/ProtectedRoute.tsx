import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import CenteredSpinner from '@components/common/CenteredSpinner';

type ProtectedRouteProps = {
  children: ReactElement;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps): ReactElement => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <CenteredSpinner />;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
