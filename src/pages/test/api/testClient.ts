import { BaseHttpClient } from "@shared/modules/api/http";

export type PublicTodo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

const publicApi = new BaseHttpClient({
  baseUrl: "https://jsonplaceholder.typicode.com"
});

export const getPublicTodo = () => {
  return publicApi.request<PublicTodo>({
    method: "GET",
    path: "/todos"
  });
};
