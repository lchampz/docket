import { ApiError, type ErrorCode } from "./client";

/**
 * Where each conflict code should appear on the form.
 *
 * A `409` does not carry `errors[]` — it carries a code and a phrase. The form
 * knows which field that conflict targets, which is why the map comes from outside.
 */
export type ConflictFieldMap = Partial<Record<ErrorCode, string>>;

type SetFieldError = (field: string, message: string) => void;

/**
 * Distributes an API error across form fields.
 *
 * @returns the message left for the toast, or `null` if everything fit in a field.
 *
 * Not every error has an owner: a `500` or network drop does not belong to any
 * field and must show as a warning. A `409` duplicate name belongs on the name
 * field — putting it in a toast forces the user to guess where the problem is.
 */
export function applyApiErrorToForm(
  error: unknown,
  setFieldError: SetFieldError,
  map: ConflictFieldMap = {},
): string | null {
  if (!(error instanceof ApiError)) {
    return "Ocorreu um erro inesperado.";
  }

  if (error.isValidation && error.errors.length > 0) {
    for (const { field, message } of error.errors) {
      setFieldError(field, message);
    }
    return null;
  }

  const targetField = map[error.code];
  if (targetField) {
    setFieldError(targetField, error.detail);
    return null;
  }

  return error.detail;
}
