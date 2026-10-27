
export type ApiValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
  public readonly status: number;
  public readonly validationErrors: ApiValidationErrors;
  public readonly details: unknown;

  constructor(
    message: string,
    status = 0,
    validationErrors: ApiValidationErrors = {},
    details?: unknown
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.validationErrors = validationErrors;
    this.details = details;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
