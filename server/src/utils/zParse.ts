import type { Request } from 'express';
import { AnyZodObject, ZodError, z } from 'zod';
import ApiError from './ApiError';
import httpStatus from 'http-status';

export async function zParse<T extends AnyZodObject>(schema: T, req: Request): Promise<z.infer<T>> {
  try {
    return await schema.parseAsync(req);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.formErrors.fieldErrors.body?.join('\n');
      const err = new ApiError(httpStatus.BAD_REQUEST, errorMessage || error.message);
      throw err;
    }
    const err = new ApiError(httpStatus.BAD_REQUEST, error.message);
    throw err;
  }
}
