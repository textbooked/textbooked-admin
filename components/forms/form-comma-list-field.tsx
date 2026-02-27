"use client";

import { FormTextField } from "@/components/forms/form-text-field";

import type { Control, FieldValues, Path } from "react-hook-form";

type FormCommaListFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
};

export function FormCommaListField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "alias one, alias two",
  description = "Comma-separated. Values are normalized to an array on submit.",
}: FormCommaListFieldProps<TFieldValues>) {
  return (
    <FormTextField
      control={control}
      name={name}
      label={label}
      placeholder={placeholder}
      description={description}
    />
  );
}
