import { createId } from "@paralleldrive/cuid2";

import type { HTTPStatusCode } from "./http-status";

/**
 * The goal of this custom error class is to normalize our errors.
 */

export type ErrorTag = "untagged 🐞" | "Payload validation 👾" | "Dev error 🤦‍♂️";

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
  status?: HTTPStatusCode;
  cause?: unknown;
  metadata?: Record<string, unknown>;
  tag?: ErrorTag;
  traceId?: string;
};

/**
 * A custom error class to normalize the error handling in our app.
 */
export class AppError extends Error {
  readonly cause: FailureReason["cause"];
  readonly metadata: FailureReason["metadata"];
  readonly tag: FailureReason["tag"];
  readonly status: FailureReason["status"];
  traceId: FailureReason["traceId"];

  constructor({
    message,
    status = 500,
    cause = null,
    metadata,
    tag = "untagged 🐞",
    traceId,
  }: FailureReason) {
    super();
    this.name = "AppError 👀";
    this.message = message;
    this.status = isAppError(cause) ? cause.status : status;
    this.cause = cause;
    this.metadata = metadata;
    this.tag = tag;
    this.traceId = traceId || createId();
  }
}

function isAppError(cause: unknown): cause is AppError {
  return cause instanceof AppError;
}
