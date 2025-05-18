export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EmailAlreadyRegisteredError extends AuthError {
  constructor() {
    super('Email already registered');
  }
}

export class EmailAlreadyWithGoogleIdError extends AuthError {
  constructor() {
    super('Email already registered with Google, Sign in with Google instead');
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid credentials');
  }
}

export class InvalidOTPError extends AuthError {
  constructor() {
    super('Invalid or expired OTP');
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super('User not found');
  }
}

export class InvalidTokenError extends AuthError {
  constructor() {
    super('Invalid or expired refresh token');
  }
}

export class InvalidTokenTypeError extends AuthError {
  constructor() {
    super('Invalid token type');
  }
}

export class MaxRetryAttemptsExceededError extends AuthError {
  constructor() {
    super('Maximum OTP retry attempts exceeded');
  }
} 