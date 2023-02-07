import type { ResponseInit } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";

import { Logger } from "./logger";
import { failure, FailureReason, success } from "./resolvers";

export function getCurrentPath(request: Request) {
  return new URL(request.url).pathname;
}

export function makeRedirectToFromHere(request: Request) {
  return new URLSearchParams([["redirectTo", getCurrentPath(request)]]);
}

export function getParentPath(request: Request) {
  return getCurrentPath(request).split("/").slice(0, -1).join("/") || "/";
}

export function getRequiredFormDataValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!value) {
    return failure({
      message: `Missing required form data`,
      metadata: { key },
    });
  }

  return success(value);
}

export function getRequiredParam(
  params: Record<string, string | undefined>,
  key: string
) {
  const value = params[key];

  if (!value) {
    return failure({
      message: `Missing required param`,
      metadata: { key },
    });
  }

  return success(value);
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

type ResponseOptions = ResponseInit & { authSession: SessionWithCookie | null };

function makePublicError({ message, metadata, traceId }: FailureReason) {
  return { message, metadata, traceId };
}

function errorResponse(
  status: number,
  reason: FailureReason,
  options: ResponseOptions
) {
  Logger.error(reason);

  return json(
    { data: null, error: makePublicError(reason) },
    {
      ...makeOptions(options),
      status,
    }
  );
}

/**
 * This is a tiny helper to normalize `json` responses.
 *
 * It also forces us to provide `{ authSession }` (or `{ authSession: null }` for unprotected routes) as second argument to not forget to handle it.
 *
 * It can be cumbersome to type, but it's worth it to avoid forgetting to handle authSession.
 */
export const response = {
  ok: <T>(data: T, options: ResponseOptions) =>
    json(
      { data, error: null },
      {
        ...makeOptions(options),
        status: 200,
      }
    ),
  serverError: (reason: FailureReason, options: ResponseOptions) =>
    errorResponse(500, reason, options),
  badRequest: (reason: FailureReason, options: ResponseOptions) =>
    errorResponse(400, reason, options),
  notFound: (reason: FailureReason, options: ResponseOptions) =>
    errorResponse(404, reason, options),
  unauthorized: (reason: FailureReason, options: ResponseOptions) =>
    errorResponse(401, reason, options),
  notAllowedMethod: (reason: FailureReason, options: ResponseOptions) =>
    errorResponse(405, reason, options),
  redirect: (url: string, options: ResponseOptions) =>
    redirect(url, {
      ...makeOptions(options),
    }),
};
