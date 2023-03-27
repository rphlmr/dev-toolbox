import { forwardRef, useState } from "react";

import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import type { FetcherWithComponents } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import ReactPhoneInput, {
  getCountryCallingCode,
} from "react-phone-number-input/input-mobile";
import type { FormProps } from "remix-validated-form";
import {
  useControlField,
  useField,
  useIsSubmitting,
  ValidatedForm,
} from "remix-validated-form";
import type { ZodTypeAny } from "zod";
import { AppError } from "~/utils/error";
import { tw } from "~/utils/tw-classes";

type HTMLInputTypes =
  | "button"
  | "checkbox"
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  | "hidden"
  | "image"
  | "month"
  | "number"
  | "password"
  | "radio"
  | "range"
  | "reset"
  | "search"
  | "submit"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week";

type InputVariations = Pick<
  VariantProps<typeof inputVariants>,
  "size" | "variant"
>;

type InputProps = Omit<React.HTMLProps<HTMLInputElement>, "size"> &
  InputVariations;

type FieldProps = InputProps & {
  icon?: React.ReactElement<{ className?: string }>;
  type?: HTMLInputTypes;
  name: string;
};

function Field({
  label,
  name,
  required,
  error,
  children,
}: FieldProps & {
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={name}>
      {!!label && (
        <span className="text-[15px] font-medium leading-[35px] text-black">
          {label}
          {required && <span className="text-gray-400">*</span>}
        </span>
      )}

      {children}

      {!!error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </label>
  );
}

const inputVariants = cva(
  [
    "flex w-full items-center overflow-hidden",
    "rounded-lg border-0 outline-none focus:outline-none focus:ring-transparent",
    "bg-white text-base font-bold placeholder:text-gray-300",
  ],
  {
    variants: {
      variant: {
        default:
          "border-2 border-gray-200 focus:border-indigo-400 read-only:focus:border-gray-200",
      },
      size: {
        default: "h-10",
        small: "h-8",
      },
      submitting: {
        true: "cursor-progress opacity-30",
      },
      error: {
        true: "border-red-300 focus:border-red-500",
      },
    },
    defaultVariants: {
      variant: undefined,
      size: "default",
    } as const,
  }
);

const BaseInput = forwardRef<HTMLInputElement, InputProps>(function BaseInput(
  props,
  ref
) {
  const { variant, id, size, className, ...rest } = props;

  if (!id) {
    throw new AppError({
      message: "Input must have an id",
      metadata: { props },
      tag: "Dev error 🤦‍♂️",
    });
  }
  const { error } = useField(id);
  const submitting = useIsSubmitting();

  return (
    <div className="relative">
      <input
        id={id}
        ref={ref}
        readOnly={submitting}
        className={tw(
          inputVariants({
            variant,
            size,
            submitting,
            error: !!error,
            className,
          })
        )}
        {...rest}
      />

      {!!error && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ExclamationCircleIcon
            className="h-6 w-6 text-red-500"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
});

function Input(props: FieldProps) {
  const {
    name,
    placeholder,
    type,
    variant = "default",
    size = "default",
  } = props;
  const { error, getInputProps } = useField(name, {
    validationBehavior: { initial: "onBlur", whenTouched: "onBlur" },
  });

  return (
    <Field error={error} {...props}>
      <BaseInput
        size={size}
        variant={variant}
        placeholder={placeholder}
        type={type}
        {...getInputProps({ id: name })}
      />
    </Field>
  );
}

function PhoneNumberInput(
  props: Omit<FieldProps, "variant" | "size"> & {
    autoComplete?: "off" | "tel";
  }
) {
  const { name, placeholder, autoComplete = "tel" } = props;
  const { error, validate } = useField(name);
  const [value, setValue] = useControlField<string>(name);
  const [focus, setFocus] = useState(false);
  const isSubmitting = useIsSubmitting();

  return (
    <Field error={error} {...props}>
      <div
        className={tw(
          "relative",
          "flex w-full items-center overflow-hidden",
          "rounded-lg border-2 border-gray-200",
          "bg-white",
          !isSubmitting && focus && "border-indigo-400",
          isSubmitting && " cursor-progress opacity-30 focus:border-gray-200",
          !!error && "border-red-300",
          !!error && focus && "border-red-500"
        )}
      >
        <div className="flex shrink-0 items-center space-x-2 pl-3">
          <img
            src={`/assets/flags/fr.png`}
            className="h-5 w-5 object-contain"
            alt={`fr's flag`}
          />
          <span className="text-base font-bold">
            +{getCountryCallingCode("FR")}
          </span>
        </div>

        <ReactPhoneInput
          id={name}
          value={value}
          onChange={setValue}
          placeholder={placeholder}
          autoComplete={autoComplete}
          international
          onFocus={() => setFocus(true)}
          inputComponent={BaseInput}
          country="FR"
          onBlur={() => {
            setFocus(false);
            validate();
          }}
        />

        <input type="hidden" name={name} value={value || ""} />
      </div>
    </Field>
  );
}

function Submit({
  label,
  formId,
}: {
  formId?: string;
  label: { default: string; busy: string };
}) {
  const isSubmitting = useIsSubmitting(formId);

  return (
    <button form={formId} disabled={isSubmitting}>
      {isSubmitting ? label.busy : label.default}
    </button>
  );
}

export function Form(
  props: Omit<FormProps<unknown>, "validator"> & {
    schema: ZodTypeAny;
    defaultValues?: Record<string, unknown>;
    subaction?: string;
    fetcher?: FetcherWithComponents<any>;
  }
) {
  const {
    schema,
    defaultValues,
    subaction,
    fetcher,
    className,
    children,
    ...rest
  } = props;
  return (
    <ValidatedForm
      validator={withZod(schema)}
      defaultValues={defaultValues}
      resetAfterSubmit
      subaction={subaction}
      fetcher={fetcher}
      className={tw("flex flex-col gap-y-4 p-1", className)}
      {...rest}
    >
      {children}
    </ValidatedForm>
  );
}

Form.Submit = Submit;
Form.Input = Input;
Form.PhoneNumberInput = PhoneNumberInput;
