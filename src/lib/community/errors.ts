export interface ServiceResult<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

export class ServiceError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ServiceError';
    this.statusCode = statusCode;
  }
}

export function serviceError(message: string, statusCode = 500): ServiceError {
  return new ServiceError(statusCode, message);
}
