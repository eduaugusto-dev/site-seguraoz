// Lógica do chat do Júpiter (somente frontend, sem servidor).
// `askJupiter` é o ponto onde, no futuro, entra a chamada à API FastAPI do Júpiter.

export type ChatRole = "user" | "jupiter";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
}

const STORAGE_KEY = "seguraoz:jupiter:messages";
const PENDING_KEY = "seguraoz:jupiter:pending";
let pendingQuestion: string | null = null;

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const DEMO_REPLIES = {
  ferias:
    "Claro! Consultei seu saldo de férias: você possui 18 dias disponíveis, com período aquisitivo encerrando em 12/03/2027. Lembre-se de que as férias devem ser solicitadas com no mínimo 30 dias de antecedência. Deseja iniciar uma solicitação?",
  beneficios:
    "Você conta hoje com vale-refeição, plano de saúde e plano odontológico. Quer que eu mostre os detalhes de algum desses benefícios?",
  ponto:
    "Seu último registro de ponto foi hoje às 08:02 e não há marcações pendentes nesta semana. Deseja consultar o espelho de ponto do mês?",
  folha:
    "Sua folha de pagamento mais recente já está disponível em Documentos. Quer que eu apresente um resumo dos valores?",
  padrao:
    "Esta é uma resposta demonstrativa do Júpiter. Em breve poderei responder às suas dúvidas sobre benefícios, ponto eletrônico, férias e folha de pagamento.",
} as const;

/** Resposta demonstrativa escolhida por palavra-chave. */
export function demoReply(question: string): string {
  const q = normalize(question);
  if (q.includes("feria")) return DEMO_REPLIES.ferias;
  if (q.includes("beneficio")) return DEMO_REPLIES.beneficios;
  if (q.includes("ponto")) return DEMO_REPLIES.ponto;
  if (q.includes("folha") || q.includes("pagamento") || q.includes("holerite") || q.includes("salario"))
    return DEMO_REPLIES.folha;
  return DEMO_REPLIES.padrao;
}

/** Ponto de integração: hoje devolve a resposta demonstrativa local. */
export async function askJupiter(question: string): Promise<string> {
  return demoReply(question);
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
    return { list: list.map((c) => (c.id === id ? { ...c, messages } : c)), id };
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
