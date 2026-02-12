/**
 * Custom error classes for AI Microservice
 */

export class AIMicroserviceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = "AIMicroserviceError";
  }
}

export class AIMicroserviceConnectionError extends AIMicroserviceError {
  constructor(message: string, originalError?: Error) {
    super(`Connection failed: ${message}`, 503, originalError);
    this.name = "AIMicroserviceConnectionError";
  }
}

export class AIMicroserviceTimeoutError extends AIMicroserviceError {
  constructor(timeoutMs?: number) {
    super(
      timeoutMs
        ? `Request to AI Microservice timed out after ${timeoutMs}ms`
        : "Request to AI Microservice timed out",
      504
    );
    this.name = "AIMicroserviceTimeoutError";
  }
}

export class AIMicroserviceValidationError extends AIMicroserviceError {
  constructor(message: string) {
    super(message, 400);
    this.name = "AIMicroserviceValidationError";
  }
}

export class AIMicroserviceStreamError extends AIMicroserviceError {
  constructor(message: string, originalError?: Error) {
    super(`Stream error: ${message}`, 502, originalError);
    this.name = "AIMicroserviceStreamError";
  }
}

export class AIMicroserviceFileProcessingError extends AIMicroserviceError {
  constructor(message: string, statusCode?: number) {
    super(`File processing failed: ${message}`, statusCode ?? 500);
    this.name = "AIMicroserviceFileProcessingError";
  }
}
