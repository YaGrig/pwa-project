export interface CustomErrorResponse {
  message?: string;
  code?: string;
  details?: any;
  error?: string;
}

export interface HttpExceptionResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  code?: string;
  details?: any;
}
