import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  adjustBalance,
  confirmDeposit,
  createDeposit,
  getAdminDeposits,
  getAdminUsers,
  getBalance,
  getDeposits,
  getTransactions,
  isAdmin,
} from "./routes/wallet";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.get("/api/balance", getBalance);
  app.get("/api/deposits", getDeposits);
  app.post("/api/deposits", createDeposit);
  app.get("/api/transactions", getTransactions);
  app.get("/api/admin/deposits", isAdmin, getAdminDeposits);
  app.post("/api/admin/deposits/:id/confirm", isAdmin, confirmDeposit);
  app.get("/api/admin/users", isAdmin, getAdminUsers);
  app.post("/api/admin/balance", isAdmin, adjustBalance);

  return app;
}
