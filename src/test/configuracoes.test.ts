import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { afterEach, describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import {
  DEMO_PROFILE,
  DEFAULT_LANGUAGE,
  applyTheme,
  getLanguage,
  getProfile,
  getTheme,
  getVersion,
  resetSettings,
  resolvedTheme,
  saveProfile,
  setLanguage,
  setTheme,
  subscribe,
  watchSystemTheme,
} from "@/configuracoes/settings";

describe("Configurações (frontend-only)", () => {
  afterEach(() => {
    resetSettings();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("is reachable at /configuracoes", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/configuracoes").at(-1)?.routeId).toBe("/configuracoes");
  });

  it("starts with the fictional profile, light theme and Brazilian Portuguese", () => {
    expect(getProfile()).toEqual(DEMO_PROFILE);
    expect(getProfile().nome).toBe("Eduardo A.");
    expect(getProfile().email).toBe("eduardo@seguraoz.com.br");
    expect(getProfile().telefone).toBe("+55 11 99999-9999");
    expect(getTheme()).toBe("claro");
    expect(getLanguage()).toBe(DEFAULT_LANGUAGE);
    expect(DEFAULT_LANGUAGE).toBe("pt-BR");
  });

  it("keeps an edit only in memory: nothing is written to storage", () => {
    saveProfile({ ...DEMO_PROFILE, nome: "Ana B.", email: "ana@seguraoz.com.br" });
    setTheme("escuro");
    setLanguage("en-US");
    expect(getProfile().nome).toBe("Ana B.");
    expect(getProfile().email).toBe("ana@seguraoz.com.br");
    expect(getTheme()).toBe("escuro");
    expect(getLanguage()).toBe("en-US");
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it("ignores blank edits instead of erasing a field", () => {
    saveProfile({ ...DEMO_PROFILE, nome: "   ", telefone: "" });
    expect(getProfile().nome).toBe("Eduardo A.");
    expect(getProfile().telefone).toBe("+55 11 99999-9999");
  });

  it("applies the chosen theme to <html> and resolves 'sistema' from the device", () => {
    applyTheme("claro");
    expect(document.documentElement.dataset["theme"]).toBe("claro");
    applyTheme("escuro");
    expect(document.documentElement.dataset["theme"]).toBe("escuro");
    expect(resolvedTheme("claro")).toBe("claro");
    expect(resolvedTheme("escuro")).toBe("escuro");
    expect(["claro", "escuro"]).toContain(resolvedTheme("sistema"));
    setTheme("sistema");
    expect(getTheme()).toBe("sistema");
    expect(document.documentElement.dataset["theme"]).toBe(resolvedTheme("sistema"));
  });

  it("follows the device only while 'sistema' is selected", () => {
    setTheme("claro");
    const stop = watchSystemTheme();
    expect(document.documentElement.dataset["theme"]).toBe("claro");
    stop();
  });

  it("offers the three language choices without claiming a translation", () => {
    expect(getLanguage()).toBe("pt-BR");
    setLanguage("es-ES");
    expect(getLanguage()).toBe("es-ES");
    expect(getProfile().nome).toBe("Eduardo A.");
  });

  it("notifies the page and restores defaults on reset", () => {
    const before = getVersion();
    let notified = 0;
    const off = subscribe(() => {
      notified += 1;
    });
    setTheme("escuro");
    expect(notified).toBe(1);
    expect(getVersion()).toBeGreaterThan(before);
    off();
    resetSettings();
    expect(notified).toBe(1);
    expect(getTheme()).toBe("claro");
    expect(getLanguage()).toBe("pt-BR");
    expect(getProfile()).toEqual(DEMO_PROFILE);
  });
});
