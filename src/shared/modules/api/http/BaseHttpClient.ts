import { AbstractHttpClient, ApiError } from "./AbstractHTTPClient";

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type BaseHttpClientOptions = {
  baseUrl: string;
  fetchFn?: FetchLike;
  defaultHeaders?: Record<string, string>;
};

export class BaseHttpClient extends AbstractHttpClient {
  protected baseUrl: string;
  private fetchFn: FetchLike;
  private defaultHeaders: Record<string, string>;

  constructor(options: BaseHttpClientOptions) {
    super();
    this.baseUrl = options.baseUrl;
    const fetchSource = options.fetchFn ?? fetch;
    this.fetchFn = fetchSource.bind(globalThis);
    this.defaultHeaders = options.defaultHeaders ?? {};
  }

  protected getDefaultHeaders(): Record<string, string> {
    return this.defaultHeaders;
  }

  protected sendRequest(url: string, init: RequestInit): Promise<Response> {
    return this.fetchFn(url, init);
  }

  protected async parseResponse<Raw>(response: Response): Promise<Raw> {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json") || contentType.includes("+json")) {
      return (await response.json()) as Raw;
    }

    return (await response.text()) as unknown as Raw;
  }

  protected createApiError(
    error: unknown,
    response?: Response,
    responsePayload?: unknown
  ): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    const payloadObject =
      typeof responsePayload === "object" && responsePayload !== null
        ? (responsePayload as Record<string, unknown>)
        : undefined;

    const errorCode =
      typeof payloadObject?.code === "string"
        ? payloadObject.code
        : typeof payloadObject?.errorCode === "string"
        ? payloadObject.errorCode
        : undefined;

    const message =
      typeof payloadObject?.message === "string"
        ? payloadObject.message
        : error instanceof Error && error.message
        ? error.message
        : "API Error";

    return new ApiError(message, response?.status, errorCode, responsePayload);
  }
}
