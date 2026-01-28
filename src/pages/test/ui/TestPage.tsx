import "@mantine/core/styles.css";
import { MantineProvider, Text } from "@mantine/core";

const TestPage = () => {
  return (
    <MantineProvider>
      <main>
        <Text>1</Text>
      </main>
    </MantineProvider>
  );
};

export default TestPage;
