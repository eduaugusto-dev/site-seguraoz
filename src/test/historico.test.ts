import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { afterEach, describe, expect, it } from "vitest";

import { createMessage, formatDate, loadConversations, saveMessages, startNewConversation, upsertConversation } from "@/jupiter/chat";
import { routeTree } from "@/routeTree.gen";

describe("Histórico", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("starts empty when no conversations are stored", () => {
    localStorage.clear();
    expect(loadConversations()).toEqual([]);
  });

  it("ignores placeholder records without a sent question", () => {
    localStorage.setItem("seguraoz:jupiter:conversations", JSON.stringify([
      { id: "placeholder", title: "Férias", messages: [] },
      { id: "bot-only", messages: [createMessage("jupiter", "Olá")] },
      { id: "blank", messages: [createMessage("user", "   ")] },
    ]));
    expect(loadConversations()).toEqual([]);
  });

  it("records the first sent message immediately with its question, date and status", () => {
    localStorage.clear();
    startNewConversation();
    const question = createMessage("user", "Quando fico de férias?");
    saveMessages([question]);
    expect(loadConversations()).toEqual([{
      id: question.id,
      title: "Quando fico de férias?",
      date: formatDate(question.createdAt),
      status: "Em andamento",
      messages: [question],
    }]);
  });

  it("uses the first question rather than a stored placeholder title", () => {
    const first = createMessage("user", "Como consulto meu ponto?");
    localStorage.setItem("seguraoz:jupiter:conversations", JSON.stringify([
      { id: first.id, title: "Título fictício", status: "Resolvido", messages: [first, createMessage("user", "E as férias?")] },
    ]));
    expect(loadConversations()[0]?.title).toBe("Como consulto meu ponto?");
    expect(loadConversations()[0]?.status).toBe("Resolvido");
  });
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
