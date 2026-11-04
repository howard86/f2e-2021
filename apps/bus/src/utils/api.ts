import type { ErrorApiResponse, SuccessApiResponse } from '@/types/api';

class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const badRequest = () => new HttpError(400, 'Bad Request');
export const notFound = () => new HttpError(404, 'Not Found');

/**
 * Runs a handler and wraps its result in the `{ success, data }` envelope
 * (errors in `{ success: false, message }`) that `localApi` consumes.
 */
export const handleApi = async <T>(
  handler: () => Promise<T> | T,
): Promise<Response> => {
  try {
    const data = await handler();

    return Response.json({
      data,
      success: true,
    } satisfies SuccessApiResponse<T>);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(
        { message: error.message, success: false } satisfies ErrorApiResponse,
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
