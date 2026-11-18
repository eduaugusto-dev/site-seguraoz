import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { createMessage, upsertConversation } from "@/jupiter/chat";
import { routeTree } from "@/routeTree.gen";

describe("Histórico", () => {
  it("is reachable at /historico", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/historico").at(-1)?.routeId).toBe("/historico");
  });

  it("titles a conversation with the first question and keeps it after more messages", () => {
    const q1 = createMessage("user", "Quando fico de férias?");
    let r = upsertConversation([], null, [q1]);
    expect(r.list[0]!.title).toBe("Quando fico de férias?");
    expect(r.list[0]!.status).toBe("Em andamento");
    r = upsertConversation(r.list, r.id, [q1, createMessage("jupiter", "x"), createMessage("user", "E o salário?")]);
    expect(r.list).toHaveLength(1);
    expect(r.list[0]!.title).toBe("Quando fico de férias?");
    expect(r.list[0]!.messages).toHaveLength(3);
  });

  it("does not record a conversation without a question", () => {
    expect(upsertConversation([], null, []).list).toHaveLength(0);
  });

  it("marks older conversations as resolved when a new one starts", () => {
    const a = upsertConversation([], null, [createMessage("user", "A")]);
    const b = upsertConversation(a.list, null, [createMessage("user", "B")]);
    expect(b.list.map((c) => [c.title, c.status])).toEqual([["B", "Em andamento"], ["A", "Resolvido"]]);
  });
});
