import type { ErrorApiResponse, SuccessApiResponse } from '@/types/api';

class HttpException extends Error {
  readonly defaultMessage: string;
  readonly status: number;

  constructor(status: number, message: string, defaultMessage: string) {
    super(message);
    this.status = status;
    this.defaultMessage = defaultMessage;
  }
}

export class BadRequestException extends HttpException {
  constructor(message?: string) {
    super(400, message ?? 'Bad Request', 'Bad Request');
  }
}

export class NotFoundException extends HttpException {
  constructor(message?: string) {
    super(404, message ?? 'Not Found', 'Not Found');
  }
}

/**
 * Mirrors next-api-handler: `{ success: true, data }` on success and
 * `{ success: false, message }` with the generic status text on failure.
 */
export const handle = async <T>(
  run: () => Promise<T> | T,
  cacheControl?: string,
): Promise<Response> => {
  try {
    const data = await run();
    return Response.json(
      {
        data,
        success: true,
      } satisfies SuccessApiResponse<T>,
      cacheControl ? { headers: { 'Cache-Control': cacheControl } } : undefined,
    );
  } catch (error) {
    if (error instanceof HttpException) {
      return Response.json(
        {
          message: error.defaultMessage,
          success: false,
        } satisfies ErrorApiResponse,
        { status: error.status },
      );
    }
    console.error(error);
    return Response.json(
      {
        message: 'Internal Server Error',
        success: false,
      } satisfies ErrorApiResponse,
      { status: 500 },
    );
  }
};
