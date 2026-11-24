
import {
  sendChatMessage,
  getConversationMessages,
} from "@/services/api";

// Mensagens e identificação da conversa permanecem somente em memória.

export type ChatRole = "user" | "jupiter";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
}

let currentConversationId = "";
let restoredMessages: ChatMessage[] = [];

export async function askJupiter(question: string): Promise<string> {
  const result = await sendChatMessage(
    question,
    currentConversationId
  );

  currentConversationId = result.conversation_id;

  return result.response;
}

export function createMessage(
  role: ChatRole,
  text: string
): ChatMessage {
  return {
    id: `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    role,
    text,
    createdAt: Date.now(),
  };
}

export type ConversationStatus = "Em andamento" | "Resolvido";

export interface Conversation {
  id: string;
  title: string;
  date: string;
  status: ConversationStatus;
  messages: ChatMessage[];
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");

  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// O histórico é carregado diretamente pela API.
// Esta função apenas entrega as mensagens restauradas à página.
export function loadMessages(): ChatMessage[] {
  const messages = restoredMessages;
  restoredMessages = [];

  return messages;
}

// Não salva mensagens no navegador.
export function saveMessages(_messages: ChatMessage[]): void {
  // Persistência realizada exclusivamente pelo backend.
}

// Abre uma conversa existente e recupera suas mensagens.
export async function openConversation(id: string): Promise<void> {
  const apiMessages = await getConversationMessages(id);

  restoredMessages = apiMessages.map((message) => ({
    id: message.id,
    role: message.role === "assistant" ? "jupiter" : "user",
    text: message.content,
    createdAt: new Date(message.created_at).getTime(),
  }));

  currentConversationId = id;
}

// Inicia uma conversa independente.
export function startNewConversation(): void {
  currentConversationId = "";
  restoredMessages = [];
}

let pendingQuestion: string | null = null;

export function queueQuestion(text: string): void {
  pendingQuestion = text.trim() || null;
}

export function takeQueuedQuestion(): string | null {
  const text = pendingQuestion;
  pendingQuestion = null;

  return text;
}
