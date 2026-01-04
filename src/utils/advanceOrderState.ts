import type { Order } from "../types/types.ts";

export type OrderState = Order["state"];

const transitions: Record<OrderState, OrderState | null> = {
  CREATED: "ANALYSIS",
  ANALYSIS: "COMPLETED",
  COMPLETED: null,
};

export function advanceOrderState(current: OrderState): OrderState {
  const next = transitions[current];
  if (!next) {
    throw new Error(`Cannot advance order from state ${current}`);
  }
  return next;
}
