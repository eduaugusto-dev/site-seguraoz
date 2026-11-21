import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import logo from "@/assets/home/home-logo.webp";
import logoutIcon from "@/assets/home/home-icon-logout.webp";
import jupiterLogo from "@/assets/jupiter/jupiter-logo.webp";
import person from "@/assets/jupiter/jupiter-person.webp";
import jupiterAvatar from "@/assets/jupiter/jupiter-avatar.webp";
import userAvatar from "@/assets/jupiter/user-avatar.webp";

import {
  askJupiter,
  createMessage,
  loadMessages,
  saveMessages,
  takeQueuedQuestion,
  type ChatMessage,
} from "./chat";
import "./jupiter.css";

const W = 1920;
const H = 1080;
const MOBILE = 900;
const REPLY_DELAY = 450;

// Centro de cada item do menu no palco 1920 (medido na referência do Júpiter).
const NAV = [
  { id: "inicio", label: "Início", center: 436.9, pad: 32 },
  { id: "jupiter", label: "Júpiter", center: 662, pad: 72, tabCenter: 665.5 },
  { id: "historico", label: "Histórico", center: 928.4, pad: 32 },
  { id: "documentos", label: "Documentos", center: 1147.5, pad: 32 },
  { id: "configuracoes", label: "Configurações", center: 1412.6, pad: 32 },
] as const;

type NavId = (typeof NAV)[number]["id"];

const SUGGESTIONS = ["Benefícios", "Ponto Eletrônico", "Férias", "Folhas de pagamento"];

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const isMobile = () => window.innerWidth < MOBILE;

export function JupiterPage() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const restored = useRef(false);
  const [active, setActive] = useState<NavId>("jupiter");
  const [tab, setTab] = useState({ left: 532, width: 267 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);

  const hasMessages = messages.length > 0;

  // Escala o palco 1920x1080 para a largura da tela (desktop/tablet).
  useIsoLayoutEffect(() => {
    const fit = () => {
      const page = pageRef.current;
      const stage = stageRef.current;
      if (!page || !stage) return;
      const vw = document.documentElement.clientWidth;
      if (isMobile()) {
        stage.style.transform = "";
        page.style.height = "";
      } else {
        const s = vw / W;
        stage.style.transform = `scale(${s})`;
        page.style.height = `${Math.max(H * s, window.innerHeight)}px`;
      }
      setReady(true);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Posiciona a aba branca sob o item ativo.
  useIsoLayoutEffect(() => {
    const measure = () => {
      const item = NAV.find((n) => n.id === active)!;
      const el = itemRefs.current[active];
      if (!el) return;
      const width = el.offsetWidth + item.pad * 2;
      const center = "tabCenter" in item ? item.tabCenter : item.center;
      setTab({ left: center - width / 2, width });
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
  }, [active]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setMessages((prev) => [...prev, createMessage("user", text)]);
    setDraft("");
    window.setTimeout(async () => {
      const reply = await askJupiter(text);
      setMessages((prev) => [...prev, createMessage("jupiter", reply)]);
    }, REPLY_DELAY);
  };

  // Restaura a conversa da sessão e envia uma pergunta vinda da Home, se houver.
  useIsoLayoutEffect(() => {
    if (restored.current) return;
    restored.current = true;
    setMessages(loadMessages());
    setLoaded(true);
    const queued = takeQueuedQuestion();
    if (queued) send(queued);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loaded) saveMessages(messages);
  }, [messages, loaded]);

  // Mantém a última mensagem visível.
  useEffect(() => {
    if (!hasMessages) return;
    if (isMobile()) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    } else {
      const el = threadRef.current;
      el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length, hasMessages]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(draft);
    }
  };

  return (
    <div className={`jp-page${ready ? " is-ready" : ""}${hasMessages ? " is-chat" : ""}`} ref={pageRef}>
      <div className="jp-stage" ref={stageRef}>
        <div className="jp-corners" aria-hidden />
        <div className="jp-content-bg" aria-hidden />

        <header className="jp-topbar">
          <Link to="/home" className="jp-logo-link" aria-label="SeguraOz Júpiter — Início">
            <img className="jp-logo" src={logo} alt="SeguraOz Júpiter" />
          </Link>

          <nav className={`jp-nav${menuOpen ? " is-open" : ""}`} aria-label="Menu principal">
            <div className="jp-tab" style={{ left: tab.left, width: tab.width }} aria-hidden />
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                ref={(el) => {
                  itemRefs.current[n.id] = el;
                }}
                className={`jp-nav-item${active === n.id ? " is-active" : ""}`}
                style={{ left: n.center }}
                aria-current={active === n.id ? "page" : undefined}
                onClick={() => {
                  setMenuOpen(false);
                  if (n.id === "inicio") {
                    navigate({ to: "/home" });
                    return;
                  }
                  if (n.id === "historico") {
                    navigate({ to: "/historico" });
                    return;
                  }
                  if (n.id === "documentos") {
                    navigate({ to: "/documentos" });
                    return;
                  }
                  setActive(n.id);
                }}
              >
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          <Link to="/" className="jp-logout">
            <img src={logoutIcon} alt="" />
            <span>Sair</span>
          </Link>

          <button
            type="button"
            className={`jp-menu-btn${menuOpen ? " is-open" : ""}`}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <main className="jp-main">
          {hasMessages ? (
            <div className="jp-thread" ref={threadRef} aria-live="polite">
              <div className="jp-day">Hoje</div>
              {messages.map((m) => (
                <div key={m.id} className={`jp-msg jp-msg--${m.role === "user" ? "user" : "bot"}`}>
                  <div className="jp-bubble-wrap">
                    <p className="jp-bubble">{m.text}</p>
                    <img
                      className="jp-avatar"
                      src={m.role === "user" ? userAvatar : jupiterAvatar}
                      alt=""
                    />
                  </div>
                  <span className="jp-msg-label">{m.role === "user" ? "Você" : "Júpiter"}</span>
                </div>
              ))}
            </div>
          ) : (
            <section className="jp-empty" aria-labelledby="jp-empty-title">
              <img className="jp-brand" src={jupiterLogo} alt="Júpiter" />
              <div className="jp-intro">
                <h1 className="jp-title" id="jp-empty-title">
                  Como posso <br />
                  ajudar <span className="jp-hl">você</span> hoje?
                </h1>
                <p className="jp-sub">
                  <svg className="jp-sub-arrow" viewBox="0 0 43 43" fill="none" aria-hidden>
                    <path
                      d="M2 2L41 41M2 41H41V2"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Você pode começar por aqui.</span>
                </p>
                <div className="jp-chips">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" className="jp-chip" onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <img
                className="jp-person"
                src={person}
                alt="Pessoa pensativa segurando um tablet, com balões de salário, horário e presente"
              />
            </section>
          )}

          <form className="jp-composer" onSubmit={onSubmit}>
            <textarea
              ref={inputRef}
              className="jp-input"
              rows={1}
              placeholder="Tire suas dúvidas com o Júpiter..."
              aria-label="Tire suas dúvidas com o Júpiter"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button type="submit" className="jp-send" aria-label="Enviar mensagem">
              <svg viewBox="0 0 94 94" fill="none" aria-hidden>
                <path
                  d="M28 66L67 27M28 27H67V66"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
