import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { askJupiter, startNewConversation } from "@/jupiter/chat";
import { sendChatMessage } from "@/services/api";
import { routeTree } from "@/routeTree.gen";

vi.mock("@/services/api", () => ({ sendChatMessage: vi.fn() }));

describe("Júpiter chat", () => {
  beforeEach(() => { vi.clearAllMocks(); startNewConversation(); });
  it("is reachable at /jupiter", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/jupiter").at(-1)?.routeId).toBe("/jupiter");
  });

  it("returns the API response and carries its conversation ID to the next request", async () => {
    vi.mocked(sendChatMessage).mockResolvedValue({ response: "Resposta da empresa", conversation_id: "conversation-1", intent: "ferias", source: "test", timestamp: "2026-11-24" });
    expect(await askJupiter("Quero consultar minhas férias")).toBe("Resposta da empresa");
    expect(sendChatMessage).toHaveBeenNthCalledWith(1, "Quero consultar minhas férias", "");
    await askJupiter("E os benefícios?");
    expect(sendChatMessage).toHaveBeenNthCalledWith(2, "E os benefícios?", "conversation-1");
  });

  it("propagates an API failure instead of generating a demo response", async () => {
    vi.mocked(sendChatMessage).mockRejectedValue(new Error("Sessão expirada"));
    await expect(askJupiter("Benefícios")).rejects.toThrow("Sessão expirada");
  });
});
