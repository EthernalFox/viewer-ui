import { RouteObject } from "react-router-dom";

import { TestPage } from "@pages/test";

export const routes: RouteObject[] = [
  {
    path: "/",
    index: true,
    element: <TestPage />
  }
];
