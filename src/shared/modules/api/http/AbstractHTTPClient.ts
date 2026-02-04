export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type RequestConfig = {
  method: HttpMethod;
  path: string;
  queryParams?: QueryParams;
  headers?: Record<string, string>;
  body?: unknown;
  abortSignal?: AbortSignal;
};

export interface ResponseFormatter<Raw, Formatted> {
  format(rawData: Raw): Formatted;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string,
    public responsePayload?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface HttpClient {
  request<Raw, Formatted = Raw>(
    config: RequestConfig,
    formatter?: ResponseFormatter<Raw, Formatted>
  ): Promise<Formatted>;
}

export abstract class AbstractHttpClient implements HttpClient {
  protected abstract baseUrl: string;

  protected abstract sendRequest(url: string, init: RequestInit): Promise<Response>;

  protected abstract parseResponse<Raw>(response: Response): Promise<Raw>;

  protected abstract createApiError(
    error: unknown,
    response?: Response,
    responsePayload?: unknown
  ): ApiError;

  protected getDefaultHeaders(): Record<string, string> {
    return {};
  }

  async request<Raw, Formatted = Raw>(
    config: RequestConfig,
    formatter?: ResponseFormatter<Raw, Formatted>
  ): Promise<Formatted> {
    const fullUrl = this.buildUrl(config.path, config.queryParams);
    const { body, shouldSetContentType } = this.prepareBody(config.body);
    const headers = { ...this.getDefaultHeaders(), ...config.headers };

    if (shouldSetContentType && !headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = "application/json";
    }

    const requestInit: RequestInit = {
      method: config.method,
      headers,
      body,
      signal: config.abortSignal
    };

    let response: Response | undefined;
    let rawPayload: Raw | undefined;

    try {
      response = await this.sendRequest(fullUrl, requestInit);
      rawPayload = await this.safeParseResponse<Raw>(response);

      if (!response.ok) {
        throw this.createApiError(new Error("HTTP error"), response, rawPayload);
      }

      if (rawPayload === undefined) {
        return rawPayload as unknown as Formatted;
      }

      return formatter ? formatter.format(rawPayload) : (rawPayload as Formatted);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw this.createApiError(error, response, rawPayload);
    }
  }

  protected buildUrl(path: string, queryParams?: QueryParams): string {
    const normalizedBase = this.baseUrl.replace(/\/$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    if (!queryParams) return `${normalizedBase}${normalizedPath}`;

    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(queryParams)) {
      if (value === null || value === undefined) continue;
      searchParams.append(key, String(value));
    }

    const queryString = searchParams.toString();
    return queryString
      ? `${normalizedBase}${normalizedPath}?${queryString}`
      : `${normalizedBase}${normalizedPath}`;
  }

  protected async safeParseResponse<Raw>(response: Response): Promise<Raw> {
    if (response.status === 204 || response.status === 205) {
      return undefined as Raw;
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return undefined as Raw;
    }

    const clonedResponse = response.clone();
    const text = await clonedResponse.text();

    if (!text || text.trim() === "") {
      return undefined as Raw;
    }

    return this.parseResponse<Raw>(response);
  }

  protected prepareBody(body?: unknown): {
    body: BodyInit | undefined;
    shouldSetContentType: boolean;
  } {
    if (body === undefined || body === null) {
      return { body: undefined, shouldSetContentType: false };
    }

    const isReadableStream =
      typeof ReadableStream !== "undefined" && body instanceof ReadableStream;

    if (
      body instanceof FormData ||
      body instanceof Blob ||
      body instanceof ArrayBuffer ||
      body instanceof URLSearchParams ||
      typeof body === "string" ||
      isReadableStream
    ) {
      return { body: body as BodyInit, shouldSetContentType: false };
    }

    if (ArrayBuffer.isView(body)) {
      return { body: body as BodyInit, shouldSetContentType: false };
    }

    return {
      body: JSON.stringify(body),
      shouldSetContentType: true
    };
  }
}
