export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const badRequest = (message: string): AppError =>
  new AppError(message, "BAD_USER_INPUT", 400);

export const notFound = (message: string): AppError =>
  new AppError(message, "NOT_FOUND", 404);

export const conflict = (message: string): AppError =>
  new AppError(message, "CONFLICT", 409);
