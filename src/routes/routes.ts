import type { Express } from "express";
import {
  loginController,
  registerController,
  getOrdersController,
  createOrderController,
} from "../controllers/controllers.ts";
import { authenticateToken } from "../middleware/auth.ts";

const routes = (app: Express) => {
  app.post("/login", loginController);
  app.post("/register", registerController);
  app.get("/orders", authenticateToken, getOrdersController);
  app.post("/orders", authenticateToken, createOrderController);
  app.patch("/orders/:id/advance", authenticateToken);
};

export default routes;
