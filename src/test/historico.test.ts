import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { afterEach, describe, expect, it } from "vitest";
import { createMessage, loadConversations, loadMessages, openConversation, queueQuestion, saveMessages, startNewConversation, takeQueuedQuestion } from "@/jupiter/chat";
import { routeTree } from "@/routeTree.gen";

describe("Disabled demo history", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    takeQueuedQuestion();
  });

  it("is reachable at /historico", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/historico").at(-1)?.routeId).toBe("/historico");
  });

  it("never records sent demo questions or replies", () => {
    startNewConversation();
    saveMessages([createMessage("user", "Férias"), createMessage("jupiter", "Resposta demonstrativa")]);
    expect(loadConversations()).toEqual([]);
    expect(localStorage.getItem("seguraoz:jupiter:conversations")).toBeNull();
    expect(sessionStorage.getItem("seguraoz:jupiter:active")).toBeNull();
  });

  it("ignores and clears previously stored conversations", () => {
    const first = createMessage("user", "Folha de pagamentos");
    localStorage.setItem("seguraoz:jupiter:conversations", JSON.stringify([{ id: first.id, messages: [first] }]));
    expect(loadConversations()).toEqual([]);
    expect(localStorage.getItem("seguraoz:jupiter:conversations")).toBeNull();
  });

  it("never restores messages between pages and clears legacy sessions without touching login", () => {
    localStorage.setItem("jupiter_login_id", "demo");
    sessionStorage.setItem("seguraoz:jupiter:messages", JSON.stringify([createMessage("user", "Ponto Eletrônico")]));
    sessionStorage.setItem("seguraoz:jupiter:active", "old");
    openConversation("old");
    expect(loadMessages()).toEqual([]);
    expect(sessionStorage.getItem("seguraoz:jupiter:messages")).toBeNull();
    expect(sessionStorage.getItem("seguraoz:jupiter:active")).toBeNull();
    expect(localStorage.getItem("jupiter_login_id")).toBe("demo");
  });

  it("forwards a Home draft once without persisting it", () => {
    queueQuestion("Benefícios");
    expect(sessionStorage.getItem("seguraoz:jupiter:pending")).toBeNull();
    expect(takeQueuedQuestion()).toBe("Benefícios");
    expect(takeQueuedQuestion()).toBeNull();
  });
});