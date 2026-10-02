export enum ApplicationExceptionStatus {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',
  BAD_GATEWAY = 'BAD_GATEWAY',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export interface ApplicationExceptionOptions<TDetails = unknown> {
  code: string;
  message: string;
  details?: TDetails;
  status: ApplicationExceptionStatus;
}

export abstract class ApplicationException<TDetails = unknown> extends Error {
  readonly code: string;
  readonly details?: TDetails;
  readonly status: ApplicationExceptionStatus;

  constructor(options: ApplicationExceptionOptions<TDetails>) {
    super(options.message);

    this.name = new.target.name;
    this.code = options.code;
    this.details = options.details;
    this.status = options.status;
  }
}
