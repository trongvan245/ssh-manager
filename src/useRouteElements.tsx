import { useRoutes } from "react-router-dom";
import DashBoardLayout from "./layouts/DashboardLaytout/DashboardLayout";
import MainPage from "./page/MainPage/MainPage";
import ConfigurationPage from "./page/ConfigurationPage/ConfigurationPage";

export default function useRouteElements() {
  const routeElements = useRoutes([
    {
      path: "",
      element: <DashBoardLayout />,
      children: [
        {
          path: "/main",
          element: <MainPage />,
        },
        {
          path: "/configuration",
          element: <ConfigurationPage />,
        },
      ],
    },
  ]);

  return routeElements;
}
