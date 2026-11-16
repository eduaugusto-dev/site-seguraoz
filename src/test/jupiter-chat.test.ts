import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { DEMO_REPLIES, demoReply } from "@/jupiter/chat";
import { routeTree } from "@/routeTree.gen";

describe("Júpiter chat", () => {
  it("is reachable at /jupiter", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/jupiter").at(-1)?.routeId).toBe("/jupiter");
  });

  it("answers a vacation question with the vacation balance reply", () => {
    expect(demoReply("Quero consultar meu saldo de férias.")).toBe(DEMO_REPLIES.ferias);
    expect(DEMO_REPLIES.ferias).toContain("18 dias disponíveis");
  });

  it("answers each suggestion chip with its own topic", () => {
    expect(demoReply("Benefícios")).toBe(DEMO_REPLIES.beneficios);
    expect(demoReply("Ponto Eletrônico")).toBe(DEMO_REPLIES.ponto);
    expect(demoReply("Folhas de pagamento")).toBe(DEMO_REPLIES.folha);
  });

  it("falls back to the generic demo reply for other questions", () => {
    expect(demoReply("Qual é o horário do refeitório?")).toBe(DEMO_REPLIES.padrao);
  });
});
