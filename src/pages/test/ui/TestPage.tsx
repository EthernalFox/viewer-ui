import "@mantine/core/styles.css";
import { MantineProvider, Text } from "@mantine/core";

export const TestPage = () => {
  return (
    <MantineProvider>
      <main>
        <Text>1</Text>
      </main>
    </MantineProvider>
  );
};
