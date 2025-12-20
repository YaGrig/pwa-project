import { useUnit } from "effector-react";
import { Navigate, useLocation } from "react-router-dom";
import {
  $authError,
  // $isAuthenticated,
  // $isAuthChecking,
} from "../../features/authorization/model/stores";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Если маршрут требует авторизации
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  // const [isAuthenticated, isAuthChecking, authError] = useUnit([
  //   $isAuthenticated,
  //   $isAuthChecking,
  //   $authError,
  // ]);
  const location = useLocation();
  const isAuthenticated = false;

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
