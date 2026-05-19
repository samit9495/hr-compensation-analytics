import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Employee, EmployeeCreate } from "@/services/types";

const schema = z.object({
  full_name: z.string().min(1, "Required").max(200),
  job_title: z.string().min(1, "Required").max(100),
  country: z.string().length(2, "ISO 2-letter code"),
  salary: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/u, "Use a decimal number, e.g. 50000.00"),
  department: z.string().max(80).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
});

export type EmployeeFormValues = z.infer<typeof schema>;

type Props = {
  defaultValues?: Partial<EmployeeFormValues>;
  initial?: Employee | null;
  submitLabel: string;
  onSubmit: (values: EmployeeCreate) => Promise<void> | void;
  onCancel?: () => void;
  submitError?: string | null;
};

const EMPTY: EmployeeFormValues = {
  full_name: "",
  job_title: "",
  country: "",
  salary: "",
  department: "",
  email: "",
};

export function EmployeeForm({
  initial,
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
  submitError,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          full_name: initial.full_name,
          job_title: initial.job_title,
          country: initial.country,
          salary: initial.salary,
          department: initial.department ?? "",
          email: initial.email ?? "",
        }
      : { ...EMPTY, ...defaultValues },
  });

  useEffect(() => {
    if (initial) {
      reset({
        full_name: initial.full_name,
        job_title: initial.job_title,
        country: initial.country,
        salary: initial.salary,
        department: initial.department ?? "",
        email: initial.email ?? "",
      });
    }
  }, [initial, reset]);

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({
          full_name: values.full_name,
          job_title: values.job_title,
          country: values.country.toUpperCase(),
          salary: values.salary,
          department: values.department ? values.department : null,
          email: values.email ? values.email : null,
        }),
      )}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      aria-label="Employee form"
      noValidate
    >
      <Field label="Full name" error={errors.full_name?.message}>
        <input
          aria-invalid={!!errors.full_name}
          className="form-input"
          {...register("full_name")}
        />
      </Field>
      <Field label="Job title" error={errors.job_title?.message}>
        <input
          aria-invalid={!!errors.job_title}
          className="form-input"
          {...register("job_title")}
        />
      </Field>
      <Field label="Country" error={errors.country?.message}>
        <input
          aria-invalid={!!errors.country}
          maxLength={2}
          className="form-input uppercase"
          {...register("country")}
        />
      </Field>
      <Field label="Salary" error={errors.salary?.message}>
        <input
          aria-invalid={!!errors.salary}
          inputMode="decimal"
          className="form-input"
          {...register("salary")}
        />
      </Field>
      <Field label="Department" error={errors.department?.message}>
        <input className="form-input" {...register("department")} />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <input type="email" className="form-input" {...register("email")} />
      </Field>

      {submitError ? (
        <p role="alert" className="col-span-full text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <div className="col-span-full flex justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ label, error, children }: FieldProps) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
