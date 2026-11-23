
import { sendChatMessage } from "@/services/api";

// Lógica do chat do Júpiter conectada à API FastAPI.
// Mensagens e ID da conversa permanecem somente em memória.

export type ChatRole = "user" | "jupiter";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
}

let currentConversationId = "";

const STORAGE_KEY = "seguraoz:jupiter:messages";
const PENDING_KEY = "seguraoz:jupiter:pending";
let pendingQuestion: string | null = null;

/**
 * Envia a pergunta à API e retorna a resposta real do Júpiter.
 * O conversation_id é mantido em memória para dar continuidade
 * às mensagens da mesma conversa.
 */
export async function askJupiter(question: string): Promise<string> {
  const result = await sendChatMessage(question, currentConversationId);

  // Atualiza o ID retornado pelo backend.
  currentConversationId = result.conversation_id;

  return result.response;
}

export function createMessage(role: ChatRole, text: string): ChatMessage {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    createdAt: Date.now(),
  };
}

// ---------- Histórico de conversas (compartilhado com a página Histórico) ----------

export type ConversationStatus = "Em andamento" | "Resolvido";

export interface Conversation {
  id: string;
  /** Sempre a primeira pergunta enviada pelo colaborador. */
  title: string;
  /** Data no formato dd/mm/aaaa. */
  date: string;
  status: ConversationStatus;
  messages: ChatMessage[];
}

const CONVERSATIONS_KEY = "seguraoz:jupiter:conversations";
const ACTIVE_KEY = "seguraoz:jupiter:active";

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function loadConversations(): Conversation[] {
  clearLegacyChatStorage();
  return [];
}

/** Retira somente os dados de chat da demonstração anterior; não toca no login. */
function clearLegacyChatStorage() {
  try {
    localStorage.removeItem(CONVERSATIONS_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* armazenamento indisponível */
  }

  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(ACTIVE_KEY);
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* armazenamento indisponível */
  }
}

/** Grava (ou atualiza) a conversa a partir das mensagens; o título é a 1ª pergunta e não muda. */
export function upsertConversation(
  list: Conversation[],
  id: string | null,
  messages: ChatMessage[],
): { list: Conversation[]; id: string | null } {
  const first = messages.find((m) => m.role === "user" && m.text.trim());
  if (!first) return { list, id };

  const existing = id ? list.find((c) => c.id === id) : undefined;

  if (existing) {
    return {
      list: list.map((c) => (c.id === id ? { ...c, messages } : c)),
      id,
    };
  }

  const conv: Conversation = {
    id: first.id,
    title: first.text,
    date: formatDate(first.createdAt),
    status: "Em andamento",
    messages,
  };

  // Demonstração: ao iniciar uma nova conversa, as anteriores passam a "Resolvido".
  const older = list.map((c) => ({ ...c, status: "Resolvido" as const }));

  return { list: [conv, ...older], id: conv.id };
}

/** Nesta etapa, mensagens existem apenas no estado da página de chat. */
export function loadMessages(): ChatMessage[] {
  clearLegacyChatStorage();
  return [];
}

/** Ponto de integração preservado, sem gravação na demonstração atual. */
export function saveMessages(_messages: ChatMessage[]) {
  clearLegacyChatStorage();
}

/** Histórico desativado; não restaura mensagens de outras páginas. */
export function openConversation(_id: string) {
  clearLegacyChatStorage();
}

/** Próxima visita ao chat começa uma conversa nova. */
export function startNewConversation() {
  clearLegacyChatStorage();
  currentConversationId = "";
}

/** Guarda uma pergunta feita fora do chat (ex.: na Home) para ser enviada ao abrir o Júpiter. */
export function queueQuestion(text: string) {
  pendingQuestion = text.trim() || null;
}

export function takeQueuedQuestion(): string | null {
  const text = pendingQuestion;
  pendingQuestion = null;
  return text;
}