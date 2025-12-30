export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
  path: string;
  method: string;
  statusCode: number;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: string;
  path: string;
  method: string;
  statusCode: number;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
