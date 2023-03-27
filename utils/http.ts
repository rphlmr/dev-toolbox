import type { CatchedResponse } from "~/utils/http.server";

export function isActionError(data: unknown): data is CatchedResponse {
  return typeof data === "object" && data !== null && "error" in data;
}
