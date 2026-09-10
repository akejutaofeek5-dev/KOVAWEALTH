export interface DemoResponse {
  message: string;
}

export type DepositMethod = "crypto" | "giftcard";
export type DepositStatus = "pending" | "confirmed" | "approved";

export interface BalanceResponse {
  balance: number;
  currency: "USD";
}

export interface Deposit {
  id: string;
  method: DepositMethod;
  amount: number;
  status: DepositStatus;
  reference: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: "deposit" | "adjustment";
  description: string;
  amount: number;
  status: "pending" | "completed" | "rejected";
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  balance: number;
}
