import { Outlet } from "react-router-dom";
import { useAuth } from '@hooks/useAuth';
import './App.css';
import CenteredSpinner from "@components/common/CenteredSpinner";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <CenteredSpinner />;
  }

  return <Outlet />;
}
