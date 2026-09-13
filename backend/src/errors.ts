import type { ErrorRequestHandler } from "express";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const apiErrors = {
  invalidAmount: () => new ApiError(400, "INVALID_AMOUNT", "Amount must be a positive whole number."),
  recipientNotFound: () => new ApiError(404, "RECIPIENT_NOT_FOUND", "Recipient was not found."),
  selfTransfer: () => new ApiError(400, "SELF_TRANSFER_NOT_ALLOWED", "You cannot send treats to yourself."),
  walletNotFound: () => new ApiError(404, "WALLET_NOT_FOUND", "Current wallet was not found."),
  insufficientBalance: () => new ApiError(409, "INSUFFICIENT_BALANCE", "Insufficient treat balance."),
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ApiError) {
    response.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  response.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong.",
    },
  });
};
