import { badRequest } from "../errors/appError";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertPositiveInt(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw badRequest(`${fieldName} must be a positive integer.`);
  }
}

export function assertValidEmail(email: string): void {
  if (!EMAIL_REGEX.test(email)) {
    throw badRequest("A valid email address is required.");
  }
}

export function assertNonEmptyTitle(title: string, message: string): void {
  if (title.trim().length === 0) {
    throw badRequest(message);
  }
}
