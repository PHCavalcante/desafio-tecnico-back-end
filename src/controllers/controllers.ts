import {
  Login,
  Register,
  GetOrders,
  CreateOrder,
  AdvanceOrder,
} from "../models/models.ts";
import type { Request, Response } from "express";
import { UserModel } from "../mongoose/schemas.ts";
import type { Order } from "../types/types.ts";
import bcrypt from "bcryptjs";

export async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Email e senha são obrigatórios");
    return;
  }
  const userExists = await UserModel.findOne({ email: email }).select(
    "+password"
  );
  if (!userExists) {
    res.status(401).send("Credenciais inválidas");
    return;
  }
  const isMatch = await bcrypt.compare(password, userExists.password);

  if (!isMatch) {
    res.status(401).send("Credenciais inválidas");
    return;
  }
  const { user, token } = await Login({ email, password });

  if (user) {
    res.status(200).json({ success: true, message: "Login bem-sucedido", token });
  } else {
    res.status(401).send("Credenciais inválidas");
  }
}

export async function registerController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send("Email e senha são obrigatórios");
      return;
    }
    if (password.length < 6) {
      res.status(400).send("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    const userExists = await UserModel.findOne({ email: email });
    if (userExists) {
      res.status(409).send("Usuário já existe");
      return;
    }
    const token = await Register({ email, password });
    res
      .status(201)
      .json({ success: true, message: "Usuário registrado com sucesso", token });
  } catch (error) {
    res.status(500).send("Erro no servidor");
    return;
  }
}

export async function getOrdersController(req: Request, res: Response) {
  try {
    const state = req.query.state as string;
    if (!state) {
      res.status(400).send("O parâmetro de consulta 'state' é obrigatório");
      return;
    }
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);

    const result = await GetOrders({ state, page, limit });

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send("Erro no servidor");
    return;
  }
}

export async function createOrderController(req: Request, res: Response) {
  const order: Order = req.body;
  if (
    !order ||
    !order.services ||
    order.services.some((service) => service.value <= 0)
  ) {
    res.status(400).send("Dados do pedido inválidos");
    return;
  }
  await CreateOrder({ order });
  res
    .status(201)
    .json({
      success: true,
      message: "Pedido criado com sucesso",
      order: order,
    });
}

export async function advanceOrderStateController(req: Request, res: Response) {
  try {
    const orderId = req.params.id; // Só pega o ID, sendo o status não obrigatório e irrelevante
    if (!orderId) {
      res.status(400).send("ID do pedido é obrigatório");
      return;
    }
    await AdvanceOrder({ id: orderId });
    res.status(200).send("Estado do pedido avançado com sucesso");
  } catch (error: any) {
    if (error.message === "Order not found") {
      res.status(404).send("Pedido não encontrado");
      return;
    } else if (error.message === "Order is already completed") {
      res.status(400).send("O pedido já está concluído");
      return;
    }
    res.status(500).send("Erro no servidor");
    return;
  }
}
