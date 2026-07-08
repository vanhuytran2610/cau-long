import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import App from "../App";
import { MainPage } from "../pages/user/MainPage";
import { LoginPage } from "../pages/admin/LoginPage";
import { AdminPage } from "../pages/admin/AdminPage";
import { UserExpensePage } from "../pages/user/UserExpensePage";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

const ProtectedRoute = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login-to-ql-page-110" replace />
  );
};

const routes = [
  {
    path: "/",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: "login-to-ql-page-110",
        element: <LoginPage />,
      },
      {
        path: "money",
        element: <UserExpensePage />,
      },
      {
        path: "admin-ql-nnh-110-page",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <AdminPage />,
          },
        ],
      },
      // other routes as children of App if needed
    ],
  },
  // Catch-all route
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

const router = createBrowserRouter(routes);

export default router;
