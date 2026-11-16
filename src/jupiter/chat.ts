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

export function loadMessages(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* armazenamento indisponível: a conversa fica só na memória */
  }
}

/** Guarda uma pergunta feita fora do chat (ex.: na Home) para ser enviada ao abrir o Júpiter. */
export function queueQuestion(text: string) {
  try {
    sessionStorage.setItem(PENDING_KEY, text);
  } catch {
    /* ignorado */
  }
}

export function takeQueuedQuestion(): string | null {
  try {
    const text = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    return text?.trim() ? text.trim() : null;
  } catch {
    return null;
  }
}
