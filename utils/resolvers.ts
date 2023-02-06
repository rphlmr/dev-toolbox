import { createId } from "@paralleldrive/cuid2";

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

/**
 * @param message The message intended for the user.
 *
 * Other params are for logging purposes and help us debug.
 * @param cause The error that caused the rejection.
 * @param metadata Additional data to help us debug.
 * @param tag A tag to help us debug and filter logs.
 *
 */
export type FailureReason = {
  message: string;
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
  cause: FailureReason["cause"];
  metadata: FailureReason["metadata"];
  tag: FailureReason["tag"];
  traceId: FailureReason["traceId"];

  constructor({
    message,
    cause = null,
    metadata,
    tag = "untagged 🤷‍♂️",
    traceId,
  }: FailureReason) {
    super();
    this.name = "AppError 👀";
    this.message = message;
    this.cause = cause;
    this.metadata = metadata;
    this.tag = tag;
    this.traceId = traceId || createId();
  }
}
