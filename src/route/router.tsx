import { createBrowserRouter, Navigate } from "react-router";
import App from "../App";
import { MainPage } from "../pages/MainPage";

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
