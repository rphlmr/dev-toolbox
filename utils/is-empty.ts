import { AppError } from "./error";

export function isEmpty(
  value:
    | string
    | null
    | undefined
    | number
    | Array<unknown>
    | ((...args: never[]) => never | void)
) {
  if (!value) return true;

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (typeof value === "number") {
    return value === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "function") {
    return false;
  }

  throw new AppError({
    message: "isEmpty: value is not a string, number, array or function",
    metadata: { value },
  });
}
