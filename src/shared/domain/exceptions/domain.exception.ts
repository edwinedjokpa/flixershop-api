interface ExceptionOptions<TDetails = unknown> {
  code: string;
  message: string;
  details?: TDetails;
}

export abstract class DomainException<TDetails = unknown> extends Error {
  readonly code: string;
  readonly details?: TDetails;

  constructor(options: ExceptionOptions<TDetails>) {
    super(options.message);

    this.name = new.target.name;
    this.code = options.code;
    this.details = options.details;
  }
}
