export type Wallet = {
  id: number;
  name: string;
  balance: number;
};

export type Cat = {
  id: number;
  name: string;
};

export type TransferRequest = {
  recipientId: number;
  amount: number;
};

export type TransferResult = {
  transfer: {
    id: number;
    sender: Cat;
    recipient: Cat;
    amount: number;
    createdAt: string;
  };
  remainingBalance: number;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};
