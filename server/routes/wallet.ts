import { RequestHandler } from "express";
import { Deposit, Transaction, User } from "@shared/api";

const currentUserId = "usr_001";
const users: User[] = [
  { id: currentUserId, name: "Alex Morgan", email: "alex@novawallet.io", role: "admin", balance: 24850.42 },
  { id: "usr_002", name: "Jamie Lee", email: "jamie@example.com", role: "user", balance: 4820.15 },
  { id: "usr_003", name: "Taylor Kim", email: "taylor@example.com", role: "user", balance: 1260.0 },
];

const deposits: Deposit[] = [
  { id: "dep_1042", method: "crypto", amount: 2500, status: "pending", reference: "0x7a2...91fd", createdAt: "2025-02-18T10:30:00.000Z" },
  { id: "dep_1041", method: "giftcard", amount: 500, status: "pending", reference: "GC-4829-1192", createdAt: "2025-02-17T15:10:00.000Z" },
  { id: "dep_1039", method: "crypto", amount: 1200, status: "confirmed", reference: "0xb19...e210", createdAt: "2025-02-14T09:00:00.000Z" },
];

const transactions: Transaction[] = [
  { id: "txn_01", type: "deposit", description: "Crypto deposit confirmed", amount: 1200, status: "completed", createdAt: "2025-02-14T09:05:00.000Z" },
  { id: "txn_02", type: "adjustment", description: "Welcome bonus", amount: 250, status: "completed", createdAt: "2025-02-10T14:20:00.000Z" },
  { id: "txn_03", type: "adjustment", description: "USDC conversion", amount: -800, status: "completed", createdAt: "2025-02-06T11:40:00.000Z" },
];

const isAdmin: RequestHandler = (req, res, next) => {
  if (req.header("x-user-role") !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
};

export const getBalance: RequestHandler = (_req, res) => {
  const user = users.find(({ id }) => id === currentUserId)!;
  res.json({ balance: user.balance, currency: "USD" });
};

export const getDeposits: RequestHandler = (_req, res) => res.json(deposits.filter(({ id }) => id));

export const createDeposit: RequestHandler = (req, res) => {
  const { method, amount, reference } = req.body as Partial<Deposit>;
  if ((method !== "crypto" && method !== "giftcard") || typeof amount !== "number" || amount <= 0 || !reference) {
    res.status(400).json({ message: "A valid method, amount, and reference are required" });
    return;
  }
  const deposit: Deposit = { id: `dep_${Date.now()}`, method, amount, status: "pending", reference, createdAt: new Date().toISOString() };
  deposits.unshift(deposit);
  res.status(201).json(deposit);
};

export const getTransactions: RequestHandler = (_req, res) => res.json(transactions);

export const getAdminDeposits: RequestHandler = (_req, res) => res.json(deposits.filter(({ status }) => status === "pending"));

export const confirmDeposit: RequestHandler = (req, res) => {
  const deposit = deposits.find(({ id }) => id === req.params.id);
  if (!deposit) { res.status(404).json({ message: "Deposit not found" }); return; }
  if (deposit.status === "confirmed") { res.json(deposit); return; }
  deposit.status = "confirmed";
  const user = users.find(({ id }) => id === currentUserId)!;
  user.balance += deposit.amount;
  transactions.unshift({ id: `txn_${Date.now()}`, type: "deposit", description: `${deposit.method === "crypto" ? "Crypto" : "Gift card"} deposit confirmed`, amount: deposit.amount, status: "completed", createdAt: new Date().toISOString() });
  res.json(deposit);
};

export const getAdminUsers: RequestHandler = (_req, res) => res.json(users);

export const adjustBalance: RequestHandler = (req, res) => {
  const { userId, amount, description } = req.body as { userId?: string; amount?: number; description?: string };
  const user = users.find(({ id }) => id === userId);
  if (!user || typeof amount !== "number" || !description) { res.status(400).json({ message: "A valid user, amount, and description are required" }); return; }
  user.balance += amount;
  if (userId === currentUserId) transactions.unshift({ id: `txn_${Date.now()}`, type: "adjustment", description, amount, status: "completed", createdAt: new Date().toISOString() });
  res.json(user);
};

export { isAdmin };
