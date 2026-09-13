import type { ApiErrorResponse, Cat, TransferRequest, TransferResult, Wallet } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiClientError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
  }
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== "object" || !("error" in value)) {
    return false;
  }

  const { error } = value as ApiErrorResponse;
  return typeof error?.code === "string" && typeof error.message === "string";
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  const body: unknown = await response.json();

  if (!response.ok) {
    if (isApiErrorResponse(body)) {
      throw new ApiClientError(body.error.code, body.error.message);
    }

    throw new ApiClientError("REQUEST_FAILED", "Unable to complete the request.");
  }

  return body as T;
}

export function getWallet() {
  return apiRequest<Wallet>("/api/wallet", { cache: "no-store" });
}

export function getRecipients() {
  return apiRequest<Cat[]>("/api/cats", { cache: "no-store" });
}

export function createTransfer(input: TransferRequest) {
  return apiRequest<TransferResult>("/api/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
