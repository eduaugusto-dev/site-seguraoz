// Configurações do Júpiter — somente frontend, sem servidor e sem persistência.
//
// O estado vive neste módulo: ele sobrevive à navegação entre páginas dentro da
// mesma visita, mas volta aos valores padrão quando o site é fechado ou recarregado.
//
// Integração futura: quando o frontend for ligado à API, o perfil passa a vir de
// GET /auth/perfil (nome, e-mail e demais campos do colaborador autenticado),
// respeitando o token de autenticação já usado pelo app.

export type Theme = "claro" | "escuro" | "sistema";

export interface Profile {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
}

/** Dados fictícios, apenas para demonstração visual. */
export const DEMO_PROFILE: Profile = {
  nome: "Eduardo A.",
  cargo: "Colaborador",
  email: "eduardo@seguraoz.com.br",
  telefone: "+55 11 99999-9999",
};

export const LANGUAGES = [
  { value: "pt-BR", label: "Português (BR)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
] as const;

export const DEFAULT_LANGUAGE = "pt-BR";

let profile: Profile = { ...DEMO_PROFILE };
let theme: Theme = "claro";
let language: string = DEFAULT_LANGUAGE;
let version = 0;

const listeners = new Set<() => void>();

function notify() {
  version += 1;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Número que muda a cada alteração — usado como snapshot estável. */
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

export function saveProfile(next: Profile): void {
  profile = {
    nome: next.nome.trim() || profile.nome,
    cargo: next.cargo.trim() || profile.cargo,
    email: next.email.trim() || profile.email,
    telefone: next.telefone.trim() || profile.telefone,
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

/** Devolve o perfil aos dados fictícios e a aparência/idioma ao padrão. */
export function resetSettings(): void {
  profile = { ...DEMO_PROFILE };
  theme = "claro";
  language = DEFAULT_LANGUAGE;
  applyTheme(theme);
  notify();
}

const systemQuery = () =>
  typeof window !== "undefined" && "matchMedia" in window
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

/** Tema realmente aplicado: "sistema" acompanha a preferência do dispositivo. */
export function resolvedTheme(theme: Theme): "claro" | "escuro" {
  if (theme !== "sistema") return theme;
  const q = systemQuery();
  return q && q.matches ? "escuro" : "claro";
}

/** Marca o tema no <html> para que os estilos possam reagir a ele. */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset["theme"] = resolvedTheme(theme);
}

/** Segue o sistema enquanto o tema "sistema" estiver ativo. */
export function watchSystemTheme(): () => void {
  const q = systemQuery();
  if (!q) return () => {};
  const onChange = () => {
    if (theme === "sistema") applyTheme(theme);
  };
  if (typeof q.addEventListener === "function") {
    q.addEventListener("change", onChange);
    return () => q.removeEventListener("change", onChange);
  }
  return () => {};
}
