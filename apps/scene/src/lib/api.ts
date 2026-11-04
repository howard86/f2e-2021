interface SuccessApiResponse<T = unknown> {
  data: T;
  success: true;
}

interface ErrorApiResponse {
  message: string;
  success: false;
}

export type ApiResponse<T = unknown> = SuccessApiResponse<T> | ErrorApiResponse;

class HttpException extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class BadRequestException extends HttpException {
  constructor() {
    super(400, 'Bad Request');
  }
}

export class NotFoundException extends HttpException {
  constructor() {
    super(404, 'Not Found');
  }
}

/** Reads a query parameter only when it was supplied exactly once. */
export const getSingleParam = (searchParams: URLSearchParams, name: string) => {
  const values = searchParams.getAll(name);

  return values.length === 1 ? values[0] : undefined;
};

/**
 * Wraps a GET handler in the `{ success, data | message }` envelope the
 * client (`services/local.ts`) expects.
 */
export const handleGet = async <T>(
  handler: (searchParams: URLSearchParams) => Promise<T>,
  request: Request,
): Promise<Response> => {
  try {
    const data = await handler(new URL(request.url).searchParams);

    return Response.json({ data, success: true } satisfies ApiResponse<T>);
  } catch (error) {
    if (error instanceof HttpException) {
      return Response.json(
        { message: error.message, success: false } satisfies ApiResponse,
        { status: error.status },
      );
    }

    console.error(error);

    return Response.json(
      {
        message: 'Internal Server Error',
        success: false,
      } satisfies ApiResponse,
      { status: 500 },
    );
  }
};
