import { z, ZodCustomIssue, ZodIssue } from "zod";
import { AppError } from "./error";
import {
  isPossiblePhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input/input-mobile";

type ZodCustomIssueWithMessage = ZodCustomIssue & { message: string };

export function createFormIssues(
  issues?: ZodIssue[]
): ZodCustomIssueWithMessage[] | undefined {
  return issues?.map(({ message, path }) => ({
    code: "custom",
    message,
    path,
  }));
}

function sanitizeSensitiveData(data: unknown) {
  if (!data || typeof data !== "object") return data;

  let sanitizedData = data;

  if ("password" in data) {
    sanitizedData = { ...sanitizedData, password: "🤫" };
  }

  if ("confirmPassword" in data) {
    sanitizedData = { ...sanitizedData, confirmPassword: "🤫" };
  }

  return sanitizedData;
}

export async function parseData<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T,
  message: string
) {
  const result = await schema.safeParseAsync(data);

  if (!result.success) {
    const issues = result.error.issues;

    throw new AppError({
      message,
      status: 400,
      metadata: { issues, data: sanitizeSensitiveData(data) },
      tag: "Payload validation 👾",
    });
  }

  return result.data as z.infer<T>;
}

type Implements<Model> = {
  [key in keyof Model]-?: undefined extends Model[key]
    ? null extends Model[key]
      ? z.ZodNullableType<z.ZodOptionalType<z.ZodType<Model[key]>>>
      : z.ZodOptionalType<z.ZodType<Model[key]>>
    : null extends Model[key]
    ? z.ZodNullableType<z.ZodType<Model[key]>>
    : z.ZodType<Model[key]>;
};

export function implement<Model = never>() {
  return {
    with: <
      Schema extends Implements<Model> & {
        [unknownKey in Exclude<keyof Schema, keyof Model>]: never;
      }
    >(
      schema: Schema
    ) => z.object(schema),
  };
}

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export function asOptionalField<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional().or(z.literal("").transform(() => undefined));
}

export function undefinedOr<T extends z.ZodTypeAny>(schema: T) {
  return schema.or(z.any().transform(() => undefined)) as z.ZodType<
    z.infer<T | z.ZodUndefined>
  >;
}

export function nullOr<T extends z.ZodSchema>(schema: T) {
  return schema.or(z.any().transform(() => null)) as z.ZodType<
    z.infer<T | z.ZodNull>
  >;
}

export function falseOr<T extends z.ZodSchema>(schema: T) {
  return schema.or(z.any().transform(() => false)) as z.ZodType<
    z.infer<T | z.ZodBoolean>
  >;
}

export function switchField() {
  return z.preprocess((arg) => arg === "on", z.boolean());
}

export function phoneNumberField(options?: {
  mobileOnly?: boolean;
  optional?: boolean;
}) {
  return z.string().superRefine((phoneNumber, ctx) => {
    if (options?.optional && !phoneNumber) {
      return phoneNumber;
    }

    if (!phoneNumber) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number is required",
      });
    }

    const parsed = parsePhoneNumber(phoneNumber);

    if (options?.mobileOnly && parsed?.getType() !== "MOBILE") {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number must be a mobile number",
      });
    }

    if (!isPossiblePhoneNumber(phoneNumber)) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number is invalid",
      });
    }

    return phoneNumber;
  });
}
