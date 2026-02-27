export interface ApiErrorParams {
  status: number;
  code: string;
  message: string;
  requestId?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;

  constructor(params: ApiErrorParams) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.requestId = params.requestId;
  }
}

export class AuthExpiredError extends ApiError {
  constructor() {
    super({
      status: 401,
      code: "auth_expired",
      message: "Session expired"
    });
    this.name = "AuthExpiredError";
  }
}
