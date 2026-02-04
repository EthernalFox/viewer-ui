# API модуль

Этот модуль дает общий HTTP-клиент и базовую реализацию на `fetch`. Идея такая:
транспортные детали (URL, заголовки, сериализация, ошибки) живут в `shared`,
а фичи/сущности работают с типизированными методами и не думают о сетевых нюансах.

## Что где лежит

- `http/AbstractHTTPClient.ts`
  - Контракт + общий пайплайн запроса.
  - Собирает URL, готовит `body`, делает безопасный парсинг и запускает форматтер.
- `http/BaseHttpClient.ts`
  - Реальная реализация на `fetch`.
  - Парсит JSON/текст и приводит ошибки к `ApiError`.

## Базовое использование

```ts
import { BaseHttpClient } from "@shared/modules/api/http";

const api = new BaseHttpClient({
  baseUrl: "https://example.com"
});

type UserDto = { id: number; name: string };

export const getUser = (id: number) => {
  return api.request<UserDto>({
    method: "GET",
    path: `/users/${id}`
  });
};
```

## Форматтер ответа (нормализация DTO)

Форматтер нужен, когда бэк прислал нестабильный контракт (snake_case, странные имена),
а в UI хочется работать с нормальной структурой.

```ts
import { ResponseFormatter } from "@shared/modules/api/http";

type RawUser = { user_id: number; full_name: string };
type User = { id: number; name: string };

const userFormatter: ResponseFormatter<RawUser, User> = {
  format(raw) {
    return { id: raw.user_id, name: raw.full_name };
  }
};

export const getUser = (id: number) =>
  api.request<RawUser, User>({ method: "GET", path: `/users/${id}` }, userFormatter);
```

## Обработка ошибок

`BaseHttpClient` всегда бросает `ApiError`. В нем лежит:

- `statusCode` (HTTP статус)
- `errorCode` (кастомный код, если пришел в payload)
- `responsePayload` (сырые данные ошибки)

Дальше это удобно разруливать на уровне UI/роутера.

```ts
try {
  await getUser(1);
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.statusCode, error.errorCode);
  }
}
```

## Важные детали поведения

- `Content-Type: application/json` ставится автоматически только для JSON-тела.
- `FormData`, `Blob`, `ArrayBuffer`, `URLSearchParams` отправляются как есть.
- Пустые ответы (204/205/нулевая длина) не ломают парсинг.
- `request` умеет опционально применять форматтер и возвращать нормализованный тип.
