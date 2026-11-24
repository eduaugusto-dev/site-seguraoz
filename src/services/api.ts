
const API_URL = "https://jupiter-backend-production.up.railway.app";

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  refresh_token: string;
  expires_in: number;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const body = new URLSearchParams({
    grant_type: "password",
    username,
    password,
  });

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.detail || "Não foi possível realizar o login."
    );
  }

  return response.json() as Promise<LoginResponse>;
}

export interface ChatResponse {
  response: string;
  intent: string;
  source: string;
  conversation_id: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export async function sendChatMessage(
  message: string,
  conversationId: string
): Promise<ChatResponse> {
  const token = sessionStorage.getItem("jupiter_access_token");

  if (!token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const response = await fetch(
    "https://jupiter-backend-production.up.railway.app/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.detail || "Não foi possível obter uma resposta do Júpiter."
    );
  }

  return response.json() as Promise<ChatResponse>;
}


export interface ApiConversation {
  id: string;
  employee_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

/**
 * Busca as conversas do colaborador autenticado.
 * O backend identifica o colaborador pelo JWT.
 */
export async function getMyConversations(): Promise<ApiConversation[]> {
  const token = sessionStorage.getItem("jupiter_access_token");

  if (!token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const response = await fetch(`${API_URL}/conversations/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail || "Não foi possível carregar seu histórico."
    );
  }

  return response.json() as Promise<ApiConversation[]>;
}
