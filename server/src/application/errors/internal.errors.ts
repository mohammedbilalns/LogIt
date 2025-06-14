import { HttpError } from "./base.errors";
import { HttpStatus } from "../../config/statusCodes";

export class BadRequestError extends HttpError {
  constructor(message: string = "Bad Request") {
    super(HttpStatus.BAD_REQUEST, message);
    this.name = "BadRequestError";
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string = "Internal Server Error") {
    super(HttpStatus.BAD_REQUEST, message);
    this.name = "InternalServerError";
  }
}
