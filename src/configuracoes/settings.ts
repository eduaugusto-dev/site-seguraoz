
export type Theme = "claro" | "escuro" | "sistema";

export interface Profile {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
}

export const LANGUAGES = [
  { value: "pt-BR", label: "Português (BR)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
] as const;

export const DEFAULT_LANGUAGE = "pt-BR";

// Perfil começa vazio. Os dados pessoais vêm da API.
let profile: Profile = {
  nome: "",
  cargo: "",
  email: "",
  telefone: "",
};

let theme: Theme = "claro";
let language: string = DEFAULT_LANGUAGE;
let version = 0;

const listeners = new Set<() => void>();

function notify() {
  version += 1;
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getVersion(): number {
  return version;
}

export function getProfile(): Profile {
  return profile;
}

export function getTheme(): Theme {
  return theme;
}

export function getLanguage(): string {
  return language;
}

/** Atualiza os dados pessoais com a resposta do backend. */
export function setProfileFromApi(data: {
  nome: string;
  cargo: string;
  email: string;
}): void {
  profile = {
    ...profile,
    nome: data.nome,
    cargo: data.cargo,
    email: data.email,
  };

  notify();
}

/** Salva somente o telefone, que ainda não possui endpoint no backend. */
export function saveProfile(next: Profile): void {
  profile = {
    ...profile,
    telefone: next.telefone.trim(),
  };

  notify();
}

export function setTheme(next: Theme): void {
  theme = next;
  applyTheme(next);
  notify();
}

export function setLanguage(next: string): void {
  language = next;
  notify();
}

export function resetSettings(): void {
  profile = {
    nome: "",
    cargo: "",
    email: "",
    telefone: "",
  };

  theme = "claro";
  language = DEFAULT_LANGUAGE;

  applyTheme(theme);
  notify();
}

const systemQuery = () =>
  typeof window !== "undefined" && "matchMedia" in window
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

export function resolvedTheme(theme: Theme): "claro" | "escuro" {
  if (theme !== "sistema") return theme;

  const query = systemQuery();

  return query && query.matches ? "escuro" : "claro";
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;

  document.documentElement.dataset["theme"] = resolvedTheme(theme);
}

export function watchSystemTheme(): () => void {
  const query = systemQuery();

  if (!query) return () => {};

  const onChange = () => {
    if (theme === "sistema") applyTheme(theme);
  };

  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", onChange);

    return () => query.removeEventListener("change", onChange);
  }

  return () => {};
}
