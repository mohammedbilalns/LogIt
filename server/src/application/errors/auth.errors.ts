import { HttpError } from "./base.errors";
import { HttpStatus } from "../../config/statusCodes";



export class UserNotFoundError extends HttpError {
  constructor(message: string = 'User not found') {
    super(HttpStatus.NOT_FOUND, message);
    this.name = 'UserNotFoundError';
  }
}

export class EmailAlreadyRegisteredError extends HttpError {
  constructor(message: string = 'Email is already registered') {
    super(HttpStatus.CONFLICT, message); 
    this.name = 'EmailAlreadyRegisteredError';
  }
}

export class InvalidCredentialsError extends HttpError {
  constructor(message: string = 'Invalid email or password') {
    super(HttpStatus.UNAUTHORIZED, message); 
    this.name = 'InvalidCredentialsError';
  }
}

export class InvalidOTPError extends HttpError {
  constructor(message: string = 'Invalid or expired OTP') {
    super(HttpStatus.UNAUTHORIZED, message); 
    this.name = 'InvalidOTPError';
  }
}

export class EmailAlreadyWithGoogleIdError extends HttpError {
  constructor(message: string = 'Email is already registered via Google sign-in') {
    super(HttpStatus.CONFLICT, message); 
    this.name = 'EmailAlreadyRegisteredWithGoogleError';
  }
}

export class InvalidPasswordError extends HttpError {
  constructor(message: string = 'Invalid password') {
    super(HttpStatus.UNAUTHORIZED, message);
    this.name = 'InvalidPasswordError';
  }
}

export class PasswordMismatchError extends HttpError {
  constructor(message: string = 'New password cannot be the same as the old password') {
    super(HttpStatus.BAD_REQUEST, message);
    this.name = 'PasswordMismatchError';
  }
}

export class InvalidProfileDataError extends HttpError {
  constructor(message: string = 'Invalid profile data') {
    super(HttpStatus.BAD_REQUEST, message);
    this.name = 'InvalidProfileDataError';
  }
}

export class UserBlockedError extends HttpError {
  constructor(message: string = 'Your account has been blocked. Please contact support.') {
    super(HttpStatus.FORBIDDEN, message);
    this.name = 'UserBlockedError';
  }
}
export class InvalidTokenError extends HttpError {
  constructor(message: string = 'Invalid or expired refresh token') {
    super(HttpStatus.UNAUTHORIZED, message);
    this.name = 'InvalidTokenError';
  }
}

export class InvalidTokenTypeError extends HttpError {
  constructor(message: string = 'Invalid token type') {
    super(HttpStatus.UNAUTHORIZED, message);
    this.name = 'InvalidTokenTypeError';
  }
}

// OTP & Auth Flow Errors
export class MaxRetryAttemptsExceededError extends HttpError {
  constructor(message: string = 'Maximum OTP retry attempts exceeded') {
    super(HttpStatus.TOO_MANY_REQUESTS, message);
    this.name = 'MaxRetryAttemptsExceededError';
  }
}

export class PasswordResetNotAllowedError extends HttpError {
  constructor(message: string = 'Google account is not allowed to reset password') {
    super(HttpStatus.FORBIDDEN, message);
    this.name = 'PasswordResetNotAllowedError';
  }
}

export class InvalidResetOTPError extends HttpError {
  constructor(message: string = 'Invalid or expired reset OTP') {
    super(HttpStatus.UNAUTHORIZED, message);
    this.name = 'InvalidResetOTPError';
  }
}