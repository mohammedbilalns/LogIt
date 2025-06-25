import { HttpError } from "./base.errors";

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(401, message);
  }
} 