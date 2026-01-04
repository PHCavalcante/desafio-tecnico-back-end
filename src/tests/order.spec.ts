import { describe, it, expect } from "vitest";
import { advanceOrderState } from "../utils/advanceOrderState.ts";
import type { OrderState } from "../utils/advanceOrderState.ts";

describe("Transições de estado do pedido", () => {
  it("avança de CREATED para ANALYSIS", () => {
    const result = advanceOrderState("CREATED");
    expect(result).toBe("ANALYSIS");
  });

  it("avança de ANALYSIS para COMPLETED", () => {
    const result = advanceOrderState("ANALYSIS");
    expect(result).toBe("COMPLETED");
  });

  it("lança erro ao tentar avançar de COMPLETED", () => {
    expect(() => advanceOrderState("COMPLETED")).toThrow(
      "Cannot advance order from state COMPLETED"
    );
  });

  it("lança erro ao receber um estado desconhecido (input inválido em tempo de execução)", () => {
    const badState = "INVALID_STATE" as unknown as OrderState;
    expect(() => advanceOrderState(badState)).toThrow(
      /Cannot advance order from state/
    );
  });
});
