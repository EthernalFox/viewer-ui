import "@mantine/core/styles.css";
import { MantineProvider, Text } from "@mantine/core";
import { useEffect, useState } from "react";

import { getPublicTodo, PublicTodo } from "../api/testClient";

export const TestPage = () => {
  const [todo, setTodo] = useState<PublicTodo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getPublicTodo()
      .then((data) => {
        if (!active) return;
        setTodo(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <MantineProvider>
      <main>
        <Text>Public API call result:</Text>
        {error && <Text c="red">{error}</Text>}
        {!error && !todo && <Text>Loading...</Text>}
        {todo && <pre>{JSON.stringify(todo, null, 2)}</pre>}
      </main>
    </MantineProvider>
  );
};
