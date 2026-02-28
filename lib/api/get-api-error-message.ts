import type { AxiosError } from "axios";

export type ApiErrorBody = {
  message?: string | string[];
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiErrorBody>;
  const message = axiosError.response?.data?.message;

  if (Array.isArray(message) && message[0]) {
    return message[0];
  }

  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
