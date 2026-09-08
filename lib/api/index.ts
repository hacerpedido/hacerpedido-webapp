export type RequestParams = Record<
  string,
  boolean | number | string | null | undefined
>;

export type JsonRequestInit = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: RequestParams | URLSearchParams;
};

/** An HTTP error that keeps the response status and decoded response body. */
export class ApiRequestError<T = unknown> extends Error {
  readonly status: number;
  readonly data: T;

  constructor(status: number, data: T) {
    super(`Request failed with status code ${status}`);
    this.name = "ApiRequestError";
    this.status = status;
    this.data = data;
  }
}

export function isApiRequestError(
  error: unknown,
): error is ApiRequestError<unknown> {
  return error instanceof ApiRequestError;
}

/** Read a server-provided message without making assumptions about its shape. */
export function getApiErrorMessage(error: unknown): string | undefined {
  if (!isApiRequestError(error)) return undefined;

  const data = error.data;
  if (typeof data !== "object" || data === null || !("message" in data)) {
    return undefined;
  }

  const message = (data as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

function isJsonBody(body: unknown): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    !(typeof Blob !== "undefined" && body instanceof Blob) &&
    !(typeof FormData !== "undefined" && body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof ArrayBuffer)
  );
}

function withParams(
  input: RequestInfo | URL,
  params: RequestParams | URLSearchParams | undefined,
): RequestInfo | URL {
  if (!params) return input;

  const searchParams =
    params instanceof URLSearchParams
      ? params
      : new URLSearchParams(
          Object.entries(params).reduce<Record<string, string>>(
            (result, [key, value]) => {
              if (value !== undefined && value !== null) {
                result[key] = String(value);
              }
              return result;
            },
            {},
          ),
        );

  if (typeof input === "string") {
    const separator = input.includes("?") ? "&" : "?";
    return `${input}${separator}${searchParams.toString()}`;
  }

  const url = new URL(
    typeof Request !== "undefined" && input instanceof Request
      ? input.url
      : input.toString(),
  );
  for (const [key, value] of searchParams) url.searchParams.append(key, value);
  return url;
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  options: JsonRequestInit = {},
): Promise<T> {
  const { body, params, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);
  const requestBody = isJsonBody(body) ? JSON.stringify(body) : body;

  if (isJsonBody(body)) headers.set("Content-Type", "application/json");

  const response = await fetch(withParams(input, params), {
    ...requestOptions,
    ...(body !== undefined ? { body: requestBody as BodyInit } : {}),
    headers,
  });
  const data = await parseResponse(response);

  if (response.status < 200 || response.status >= 300) {
    throw new ApiRequestError(response.status, data);
  }

  return data as T;
}
