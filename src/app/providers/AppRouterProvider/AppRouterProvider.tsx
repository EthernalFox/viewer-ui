import { RouterProvider } from "react-router";

import { AppRouter } from "@shared/modules/router/AppRouter";

export const AppRouterProvider = () => {
  return <RouterProvider router={AppRouter} />;
};
