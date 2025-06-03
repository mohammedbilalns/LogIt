export class UserNotFoundError extends Error {
  constructor(message: string = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class InvalidPasswordError extends Error {
  constructor(message: string = 'Invalid password') {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}

export class PasswordMismatchError extends Error {
  constructor(message: string = 'New password cannot be the same as the old password') {
    super(message);
    this.name = 'PasswordMismatchError';
  }
}

export class InvalidProfileDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidProfileDataError';
  }
}

export class UserBlockedError extends Error {
  constructor(message: string = 'Your account has been blocked. Please contact support.') {
    super(message);
    this.name = 'UserBlockedError';
  }
} 