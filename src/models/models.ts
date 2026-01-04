import { connect } from "../database/db.ts";
import type { Order, User } from "../types/types.ts";
import { UserModel, OrderModel } from "../mongoose/schemas.ts";
import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

await connect();

interface GetOrdersParams {
  state: string;
  page: number;
  limit: number;
}

const generateToken = (id: string | number) => {
  const secret: Secret = (process.env.JWT_SECRET ?? "default_secret") as Secret;
  const expiresInValue: NonNullable<SignOptions["expiresIn"]> = (process.env
    .JWT_EXPIRE ?? "7d") as NonNullable<SignOptions["expiresIn"]>;
  const options: SignOptions = {
    expiresIn: expiresInValue,
  };
  return jwt.sign({ id }, secret, options);
};

export async function Login({ email, password }: User) {
  const User = UserModel;
  const user = await User.findOne({ email: email }).select("+password");
  if (!user) {
    return { user: null, token: "" };
  }
  const isMatch = await User.schema.methods.comparePassword.call(
    user,
    password
  );
  if (!isMatch) {
    return { user: null, token: "" };
  }
  const token = generateToken(email);
  return { user, token };
}

export async function Register({ email, password }: User): Promise<string> {
  const User = UserModel;
  await User.create({ email: email, password: password });
  const token = generateToken(email);
  return token;
}

export async function GetOrders({ state, page, limit }: GetOrdersParams) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    OrderModel.find({ state }).skip(skip).limit(limit).sort({ createdAt: -1 }),
    OrderModel.countDocuments({ state }),
  ]);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function CreateOrder({ order }: { order: Order }) {
  const Order = OrderModel;
  await Order.create({
    lab: order.lab,
    patient: order.patient,
    customer: order.customer,
    state: "CREATED",
    status: "ACTIVE",
    services: order.services,
  });
}

export async function AdvanceOrder({ id }: { id: string }) {
  const Order = OrderModel;
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");
  // sendo o status não obrigatório, avança o estado automaticamente comforme a lógica abaixo
  // caso o fosse obrigatório seria só usar a função advanceOrderState de utils/advanceOrderState.ts

  switch (order.state) {
    case "CREATED":
      order.state = "ANALYSIS";
      break;
    case "ANALYSIS":
      order.state = "COMPLETED";
      break;
    case "COMPLETED":
      throw new Error("Order is already completed");
  }

  await order.save();
}
