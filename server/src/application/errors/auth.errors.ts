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

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid credentials');
  }
}

export class EmailNotVerifiedError extends AuthError {
  constructor() {
    super('Email not verified');
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