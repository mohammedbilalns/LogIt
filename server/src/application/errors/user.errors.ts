export class UserNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}

export class InvalidPasswordError extends Error {
  constructor() {
    super('Invalid password');
    this.name = 'InvalidPasswordError';
  }
}

export class PasswordMismatchError extends Error {
  constructor() {
    super('New password cannot be the same as the old password');
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
  constructor() {
    super('Your account has been blocked. Please contact support.');
    this.name = 'UserBlockedError';
  }
} 