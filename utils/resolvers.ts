import { createId } from "@paralleldrive/cuid2";
import { Logger } from "./logger";

/**
 * The goal of these resolvers is to normalize the return type of our functions and force us to handle errors.
 */

/**
 * A type to normalize the return type of our services/async functions.
 *
 * Forces us to handle both the happy path and the sad path.
 */
export type Either<T> = Success<T> | Failure;

/**
 * A type to normalize the happy path return type of our services functions.
 */
export type Success<T> = { data: T; error: null };

/**
 * A function to normalize the happy path return type of our services functions.
 *
 * Works together with `failure` function.
 */
export function success<T>(data: T): Success<T> {
  return { data, error: null };
}

/**
 * A type to normalize the sad path return type of our services functions.
 */
export type Failure = {
  data: null;
  error: AppError;
};

type HTTPStatusCode = 400 | 401 | 404 | 404 | 405 | 500;
type HTTPStatusText =
  | "bad_request"
  | "unauthorized"
  | "not_found"
  | "method_not_allowed"
  | "server_error";

const HTTPStatus = {
  bad_request: 400,
  unauthorized: 401,
  not_found: 404,
  method_not_allowed: 405,
  server_error: 500,
} satisfies Record<HTTPStatusText, HTTPStatusCode>;

/**
 * @param message The message intended for the user.
 *
 * Other params are for logging purposes and help us debug.
 * @param status The HTTP status code text.
 * @param cause The error that caused the rejection.
 * @param metadata Additional data to help us debug.
 * @param tag A tag to help us debug and filter logs.
 *
 */
export type FailureReason = {
  message: string;
  status?: HTTPStatusText;
  cause?: unknown;
  metadata?: Record<string, unknown>;
  tag?: string;
  traceId?: string;
};

/**
 * A function to normalize the sad path return type of our services functions.
 *
 * Works together with `success` function.
 */
export function failure(reason: FailureReason): Failure {
  const error = new AppError(reason);

  return { error, data: null };
}

/**
 * A custom error class to normalize the error handling in our app.
 */
export class AppError extends Error {
  readonly cause: FailureReason["cause"];
  readonly metadata: FailureReason["metadata"];
  readonly tag: FailureReason["tag"];
  readonly status: HTTPStatusCode;
  traceId: FailureReason["traceId"];

  constructor({
    message,
    cause = null,
    metadata,
    tag = "untagged 🐞",
    traceId,
    status = "server_error",
  }: FailureReason) {
    super();
    this.name = "SupaStripeStackError 👀";
    this.message = message;
    this.cause = cause;
    this.metadata = metadata;
    this.tag = tag;
    this.status = HTTPStatus[status];
    this.traceId = traceId || createId();

    Logger.error(this);
  }
}
