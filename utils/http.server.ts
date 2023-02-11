import { createId } from "@paralleldrive/cuid2";
import { defer, ResponseInit } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";

import { AppError, FailureReason } from "./error";
import { HTTPStatusCode } from "./http-status";
import { Logger } from "./logger";

export function getCurrentPath(request: Request) {
  return new URL(request.url).pathname;
}

export function makeRedirectToFromHere(request: Request) {
  return new URLSearchParams([["redirectTo", getCurrentPath(request)]]);
}

export function getParentPath(request: Request) {
  return getCurrentPath(request).split("/").slice(0, -1).join("/") || "/";
}

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param to The redirect destination
 * @param defaultRedirect The redirect to use if the `to` is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect = "/"
) {
  if (
    !to ||
    typeof to !== "string" ||
    !to.startsWith("/") ||
    to.startsWith("//")
  ) {
    return defaultRedirect;
  }

  return to;
}

type ResponseOptions = ResponseInit & {
  authSession: SessionWithCookie | null;
  status?: HTTPStatusCode;
};

function makeOptions({ authSession, ...options }: ResponseOptions) {
  const headers = new Headers(options.headers);

  if (authSession) {
    headers.append("Set-Cookie", authSession.cookie);
  }

  return { ...options, headers };
}
export type SessionWithCookie<T = unknown> = T & {
  cookie: string;
};

type ResponsePayload = Record<string, unknown>;

function makeReason(cause: unknown) {
  if (cause instanceof AppError) {
    return cause;
  }

  return new AppError({
    cause,
    message: "Sorry, something went wrong.",
  });
}

export type CatchResponse = ReturnType<typeof makeErrorPayload>;

function makeErrorPayload({ message, metadata, traceId }: AppError) {
  return { error: { message, metadata, traceId } };
}

function makeOkPayload<T extends ResponsePayload>(data: T) {
  return { error: null, ...data };
}

/**
 * This is a tiny helper to normalize `json` responses.
 *
 * It also forces us to provide `{ authSession }` (or `{ authSession: null }` for unprotected routes) as second argument to not forget to handle it.
 *
 * It can be cumbersome to type, but it's worth it to avoid forgetting to handle authSession.
 */
export const response = {
  ok: <T extends ResponsePayload>(data: T, options: ResponseOptions) =>
    json(makeOkPayload(data), makeOptions({ status: 200, ...options })),
  /**
   * When we want to return or throw an error response. Works with `response.ok` and `response.defer`
   *
   * **With `response.defer`, use it only in the case you want to throw an error response.**
   */
  error: (cause: unknown, options: ResponseOptions) => {
    const reason = makeReason(cause);

    Logger.error(reason);

    return json(
      makeErrorPayload(reason),
      makeOptions({ status: reason.status, ...options })
    );
  },
  defer: <T extends ResponsePayload>(data: T, options: ResponseOptions) =>
    defer(makeOkPayload(data), makeOptions({ status: 200, ...options })),
  /**
   * When we want to return a deferred error response.
   *
   * Works only with `response.defer`.
   *
   * It should only be used when we want to **return a deferred response.**
   *
   * **Could not be thrown.** If you want to throw an error response, use `response.error` instead.
   */
  deferError: (cause: unknown, options: ResponseOptions) => {
    const reason = makeReason(cause);

    Logger.error(reason);

    return defer(
      makeErrorPayload(reason),
      makeOptions({ status: reason.status, ...options })
    );
  },
  redirect: (url: string, options: ResponseOptions) =>
    redirect(url, makeOptions(options)),
};
