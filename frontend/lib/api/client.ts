/**
 * Single HTTP client for the frontend.
 *
 * The browser always calls a relative path; the Next rewrite reaches the
 * backend on the server side (see docs Decisoes D9). Server components have no
 * origin, so they use the internal URL.
 */

const TIMEOUT_MS = 10_000;

const baseUrl = () =>
  typeof window === "undefined"
    ? `${process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080"}/api/v1`
    : "/api/v1";

/** A validation error tied to the field that caused it. */
export type FieldError = { field: string; message: string };

/**
 * Stable backend error code. The screen decides what to do from here, never from
 * the message text.
 */
export type ErrorCode =
  | "VALIDACAO"
  | "NAO_ENCONTRADO"
  | "PAR_CARTORIO_DOCUMENTO_INVALIDO"
  | "NOME_DUPLICADO"
  | "RECURSO_EM_USO"
  | "ERRO_INTERNO"
  | "REDE";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    readonly detail: string,
    readonly errors: FieldError[] = [],
  ) {
    super(detail);
    this.name = "ApiError";
  }

  /** Message for a specific field, to show under the input. */
  fieldError(field: string): string | undefined {
    return this.errors.find((e) => e.field === field)?.message;
  }

  get isValidation() {
    return this.code === "VALIDACAO";
  }
}

type ProblemDetail = {
  status?: number;
  detail?: string;
  title?: string;
  codigo?: ErrorCode;
  errors?: Array<{ campo: string; mensagem: string }>;
};

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ProblemDetail;
    const errors = (body.errors ?? []).map((e) => ({
      field: e.campo,
      message: e.mensagem,
    }));
    return new ApiError(
      response.status,
      body.codigo ?? "ERRO_INTERNO",
      body.detail ?? body.title ?? "Erro ao processar a requisição.",
      errors,
    );
  } catch {
    // Error response without JSON body — proxy down, error HTML, 502.
    return new ApiError(
      response.status,
      "ERRO_INTERNO",
      "O servidor respondeu de forma inesperada.",
    );
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      ...init,
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch (cause) {
    // Network down or timeout never arrive as Response. Without this branch the
    // screen gets a raw TypeError and the toast shows "Failed to fetch".
    const timedOut = cause instanceof DOMException && cause.name === "TimeoutError";
    throw new ApiError(
      0,
      "REDE",
      timedOut
        ? "O servidor demorou demais para responder."
        : "Não foi possível falar com o servidor.",
    );
  }

  if (!response.ok) {
    throw await toApiError(response);
  }
  // 204 and 205 have no body; calling json() here would throw.
  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const get = <T>(path: string) => api<T>(path);

export const post = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) });

export const put = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "PUT", body: JSON.stringify(body) });

export const patch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "PATCH", body: JSON.stringify(body) });

export const del = (path: string) => api<void>(path, { method: "DELETE" });
