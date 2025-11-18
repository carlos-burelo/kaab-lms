/**
 * Base Error Classes for Domain-Driven Design
 * Provides a hierarchy of errors for different layers
 */

/**
 * Base application error
 */
export abstract class AppError extends Error {
  public readonly timestamp: Date;
  public readonly code: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code || this.constructor.name;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }

  abstract get statusCode(): number;

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Domain Layer Errors
 */
export class DomainError extends AppError {
  get statusCode(): number {
    return 400;
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly constraints?: Record<string, string>
  ) {
    super(message, 'VALIDATION_ERROR');
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      field: this.field,
      constraints: this.constraints,
    };
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message, 'BUSINESS_RULE_ERROR');
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(
    public readonly entityName: string,
    public readonly identifier: string | Record<string, unknown>
  ) {
    super(
      `${entityName} with ${typeof identifier === 'string' ? `id ${identifier}` : `criteria ${JSON.stringify(identifier)}`} not found`,
      'ENTITY_NOT_FOUND'
    );
  }

  get statusCode(): number {
    return 404;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      entityName: this.entityName,
      identifier: this.identifier,
    };
  }
}

export class DuplicateEntityError extends DomainError {
  constructor(
    public readonly entityName: string,
    public readonly field: string,
    public readonly value: string
  ) {
    super(
      `${entityName} with ${field} '${value}' already exists`,
      'DUPLICATE_ENTITY'
    );
  }

  get statusCode(): number {
    return 409;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      entityName: this.entityName,
      field: this.field,
      value: this.value,
    };
  }
}

/**
 * Application Layer Errors
 */
export class ApplicationError extends AppError {
  get statusCode(): number {
    return 500;
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED');
  }

  get statusCode(): number {
    return 401;
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string = 'Forbidden access') {
    super(message, 'FORBIDDEN');
  }

  get statusCode(): number {
    return 403;
  }
}

export class InvalidCredentialsError extends ApplicationError {
  constructor(message: string = 'Invalid credentials') {
    super(message, 'INVALID_CREDENTIALS');
  }

  get statusCode(): number {
    return 401;
  }
}

export class TokenExpiredError extends ApplicationError {
  constructor(message: string = 'Token has expired') {
    super(message, 'TOKEN_EXPIRED');
  }

  get statusCode(): number {
    return 401;
  }
}

/**
 * Infrastructure Layer Errors
 */
export class InfrastructureError extends AppError {
  get statusCode(): number {
    return 500;
  }
}

export class DatabaseError extends InfrastructureError {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message, 'DATABASE_ERROR');
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      originalError: this.originalError?.message,
    };
  }
}

export class ExternalServiceError extends InfrastructureError {
  constructor(
    public readonly serviceName: string,
    message: string,
    public readonly originalError?: Error
  ) {
    super(`${serviceName}: ${message}`, 'EXTERNAL_SERVICE_ERROR');
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      serviceName: this.serviceName,
      originalError: this.originalError?.message,
    };
  }
}

export class FileOperationError extends InfrastructureError {
  constructor(
    public readonly operation: 'read' | 'write' | 'delete' | 'upload',
    message: string
  ) {
    super(`File ${operation} failed: ${message}`, 'FILE_OPERATION_ERROR');
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
    };
  }
}

/**
 * Presentation Layer Errors
 */
export class PresentationError extends AppError {
  get statusCode(): number {
    return 400;
  }
}

export class InvalidInputError extends PresentationError {
  constructor(
    message: string,
    public readonly errors?: Array<{ field: string; message: string }>
  ) {
    super(message, 'INVALID_INPUT');
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}

export class RateLimitError extends PresentationError {
  constructor(
    public readonly retryAfter: number,
    message: string = 'Rate limit exceeded'
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED');
  }

  get statusCode(): number {
    return 429;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Error Factory
 */
export class ErrorFactory {
  static validation(
    message: string,
    field?: string,
    constraints?: Record<string, string>
  ): ValidationError {
    return new ValidationError(message, field, constraints);
  }

  static businessRule(message: string): BusinessRuleError {
    return new BusinessRuleError(message);
  }

  static notFound(
    entityName: string,
    identifier: string | Record<string, unknown>
  ): EntityNotFoundError {
    return new EntityNotFoundError(entityName, identifier);
  }

  static duplicate(
    entityName: string,
    field: string,
    value: string
  ): DuplicateEntityError {
    return new DuplicateEntityError(entityName, field, value);
  }

  static unauthorized(message?: string): UnauthorizedError {
    return new UnauthorizedError(message);
  }

  static forbidden(message?: string): ForbiddenError {
    return new ForbiddenError(message);
  }

  static database(message: string, error?: Error): DatabaseError {
    return new DatabaseError(message, error);
  }

  static externalService(
    serviceName: string,
    message: string,
    error?: Error
  ): ExternalServiceError {
    return new ExternalServiceError(serviceName, message, error);
  }

  static invalidInput(
    message: string,
    errors?: Array<{ field: string; message: string }>
  ): InvalidInputError {
    return new InvalidInputError(message, errors);
  }
}
