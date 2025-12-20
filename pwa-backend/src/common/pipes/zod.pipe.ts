import { PipeTransform, BadRequestException } from '@nestjs/common'
import { ZodError, ZodSchema } from 'zod'
// interface FormattedZodError {
//   field: string
//   message: string
//   code: string
// }

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value)
      return parsedValue
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error,
          statusCode: 400,
        })
      }
      throw new BadRequestException('Validation failed')
    }
  }

  // private formatZodErrors(error: ZodError): FormattedZodError[] {
  //   return error.errors.map((err: ZodIssue) => {
  //     const field = Array.isArray(err.path) ? err.path.join('.') : '';
  //     const message =
  //       typeof err.message === 'string' ? err.message : 'Validation error';
  //     const code = typeof err.code === 'string' ? err.code : 'invalid_type';

  //     return {
  //       field,
  //       message,
  //       code,
  //     };
  //   });
  // }
}
