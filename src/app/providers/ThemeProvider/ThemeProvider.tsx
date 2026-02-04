import { MantineProvider } from "@mantine/core";
import React, { FC } from "react";

import { ChildrenType } from "@shared/types/ChildrenType";

export const ThemeProvider: FC<ChildrenType> = ({ children }) => {
  return <MantineProvider>{children}</MantineProvider>;
};
