// types/response.types.ts
export interface BaseResponse<T = any> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
  method: string;
  statusCode: number;
}

export interface PaginatedResponse<T = any> extends BaseResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    // можно добавить другие поля пагинации
  };
}

export interface PaginatedData<T = any> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

// Type guard для проверки пагинированных данных
// export function isPaginatedData(data: any): data is PaginatedData {
//   return (
//     data &&
//     Array.isArray(data.items) &&
//     data.meta &&
//     typeof data.meta.page === 'number' &&
//     typeof data.meta.limit === 'number' &&
//     typeof data.meta.total === 'number'
//   );
// }
