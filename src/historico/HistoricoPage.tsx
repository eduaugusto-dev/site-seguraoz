
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import logo from "@/assets/home/home-logo.webp";
import logoutIcon from "@/assets/home/home-icon-logout.webp";
import emptyIll from "@/assets/historico/historico-empty.webp";
import searchIll from "@/assets/historico/historico-search.webp";

import {
  openConversation,
  startNewConversation,
  type Conversation,
} from "@/jupiter/chat";

import { getMyConversations } from "@/services/api";

import "./historico.css";

const W = 1920;
const H = 1200;
const MOBILE = 900;

// Centro de cada item do menu no palco 1920.
const NAV = [
  { id: "inicio", label: "Início", center: 408, pad: 32 },
  { id: "jupiter", label: "Júpiter", center: 579.5, pad: 32 },
  { id: "historico", label: "Histórico", center: 858, pad: 72, tabCenter: 859.5 },
  { id: "documentos", label: "Documentos", center: 1174, pad: 32 },
  { id: "configuracoes", label: "Configurações", center: 1439.5, pad: 32 },
] as const;

type NavId = (typeof NAV)[number]["id"];

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function Arrow({ className, down }: { className: string; down?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 84 84" fill="none" aria-hidden>
      <path
        d={down ? "M8 8L76 76M8 76H76V8" : "M10 74L76 8M10 8H76V74"}
        stroke="currentColor"
        strokeWidth={down ? 9 : 7}
        strokeLinecap="square"
      />
    </svg>
  );
}

export function HistoricoPage() {
  const navigate = useNavigate();

  const pageRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [active, setActive] = useState<NavId>("historico");
  const [tab, setTab] = useState({ left: 711, width: 297 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const hasHistory = (conversations?.length ?? 0) > 0;

  // Ajuste responsivo do palco.
  useIsoLayoutEffect(() => {
    const fit = () => {
      const page = pageRef.current;
      const stage = stageRef.current;

      if (!page || !stage) return;

      if (window.innerWidth < MOBILE) {
        stage.style.transform = "";
        page.style.height = "";
      } else {
        const s = document.documentElement.clientWidth / W;
        stage.style.transform = `scale(${s})`;
        page.style.height = `${Math.max(H * s, window.innerHeight)}px`;
      }

      setReady(true);
    };

    fit();

    window.addEventListener("resize", fit);

    return () => window.removeEventListener("resize", fit);
  }, []);

  // Posicionamento da aba ativa do menu.
  useIsoLayoutEffect(() => {
    const measure = () => {
      const item = NAV.find((n) => n.id === active);
      const el = itemRefs.current[active];

      if (!item || !el) return;

      const width = el.offsetWidth + item.pad * 2;
      const center = "tabCenter" in item ? item.tabCenter : item.center;

      setTab({ left: center - width / 2, width });
    };

    measure();

    document.fonts?.ready.then(measure).catch(() => {});
  }, [active]);

  // Busca as conversas reais do colaborador autenticado.
  useEffect(() => {
    let cancelled = false;

    const fetchConversations = async () => {
      try {
        setHistoryError(null);

        const data = await getMyConversations();

        if (cancelled) return;

        const formatted: Conversation[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          date: new Date(item.created_at).toLocaleDateString("pt-BR"),
          status:
            item.status === "active" && !item.archived_at
              ? "Em andamento"
              : "Resolvido",
          messages: [],
        }));

        setConversations(formatted);
      } catch (error) {
        if (cancelled) return;

        console.error("Erro ao carregar histórico:", error);

        setHistoryError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o histórico."
        );
      }
    };

    fetchConversations();

    return () => {
      cancelled = true;
    };
  }, []);


// Abre uma conversa existente e aguarda a recuperação das mensagens.
const [openingConversation, setOpeningConversation] = useState(false);

const open = async (id: string) => {
  if (openingConversation) return;

  try {
    setOpeningConversation(true);
    setHistoryError(null);

    await openConversation(id);

    navigate({ to: "/jupiter" });
  } catch (error) {
    console.error("Erro ao abrir conversa:", error);

    setHistoryError(
      error instanceof Error
        ? error.message
        : "Não foi possível abrir esta conversa."
    );
  } finally {
    setOpeningConversation(false);
  }
};

  // Inicia uma conversa nova.
  const newChat = () => {
    startNewConversation();
    navigate({ to: "/jupiter" });
  };

  return (
    <div
      className={`hs-page${ready && conversations ? " is-ready" : ""}`}
      ref={pageRef}
    >
      <div className="hs-stage" ref={stageRef}>
        <div className="hs-corners" aria-hidden />
        <div className="hs-content-bg" aria-hidden />

        <header className="hs-topbar">
          <Link
            to="/home"
            className="hs-logo-link"
            aria-label="SeguraOz Júpiter — Início"
          >
            <img className="hs-logo" src={logo} alt="SeguraOz Júpiter" />
          </Link>

          <nav
            className={`hs-nav${menuOpen ? " is-open" : ""}`}
            aria-label="Menu principal"
          >
            <div
              className="hs-tab"
              style={{ left: tab.left, width: tab.width }}
              aria-hidden
            />

            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                ref={(el) => {
                  itemRefs.current[n.id] = el;
                }}
                className={`hs-nav-item${active === n.id ? " is-active" : ""}`}
                style={{ left: n.center }}
                aria-current={active === n.id ? "page" : undefined}
                onClick={() => {
                  setMenuOpen(false);

                  if (n.id === "inicio") navigate({ to: "/home" });
                  else if (n.id === "jupiter") navigate({ to: "/jupiter" });
                  else if (n.id === "documentos") navigate({ to: "/documentos" });
                  else if (n.id === "configuracoes")
                    navigate({ to: "/configuracoes" });
                  else setActive(n.id);
                }}
              >
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          <Link to="/" className="hs-logout">
            <img src={logoutIcon} alt="" />
            <span>Sair</span>
          </Link>

          <button
            type="button"
            className={`hs-menu-btn${menuOpen ? " is-open" : ""}`}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <main className="hs-main">
          {/* Estado de erro da API */}
          {historyError && (
            <section className="hs-empty" role="alert">
              <div className="hs-empty-text">
                <h1 className="hs-empty-title">
                  Não foi possível carregar seu histórico.
                </h1>

                <p className="hs-empty-sub">{historyError}</p>

                <button
                  type="button"
                  className="hs-btn hs-btn--primary"
                  onClick={() => window.location.reload()}
                >
                  Tentar novamente
                </button>
              </div>
            </section>
          )}

          {/* Carregamento */}
          {!historyError && conversations === null && (
            <section className="hs-empty" aria-live="polite">
              <div className="hs-empty-text">
                <h1 className="hs-empty-title">
                  Carregando suas conversas...
                </h1>
              </div>
            </section>
          )}

          {/* Histórico vazio */}
          {!historyError && conversations !== null && !hasHistory && (
            <section className="hs-empty" aria-labelledby="hs-empty-title">
              <div className="hs-empty-art">
                <img
                  className="hs-empty-ill"
                  src={emptyIll}
                  alt="Pessoa procurando dentro de uma pasta vazia"
                />
              </div>

              <div className="hs-empty-text">
                <h1 className="hs-empty-title" id="hs-empty-title">
                  Você <span className="hs-hl">ainda</span> não tem <br className="hs-br" />
                  conversas com Júpiter.
                </h1>

                <p className="hs-empty-sub">
                  Converse com o Júpiter e descubra uma nova forma de ser atendido.
                </p>

                <button
                  type="button"
                  className="hs-btn hs-btn--primary"
                  onClick={newChat}
                >
                  Acesse Júpiter
                </button>

                <Link to="/home" className="hs-btn hs-btn--ghost">
                  Voltar ao início
                </Link>
              </div>
            </section>
          )}

          {/* Histórico com conversas */}
          {!historyError && conversations !== null && hasHistory && (
            <section className="hs-list" aria-labelledby="hs-title">
              <div className="hs-list-head">
                <Arrow className="hs-head-arrow" down />

                <h1 className="hs-title" id="hs-title">
                  Histórico
                </h1>
              </div>

              <p className="hs-sub">
                Suas conversas anteriores com Júpiter.
              </p>

              <img
                className="hs-search-ill"
                src={searchIll}
                alt="Pessoa examinando um monitor com uma lupa"
              />

              <div
                className="hs-table"
                role="table"
                aria-label="Conversas com o Júpiter"
              >
                <div className="hs-row-head" role="row">
                  <span role="columnheader">Assunto</span>
                  <span role="columnheader">Status</span>
                  <span role="columnheader">Data</span>
                </div>

                <div className="hs-rows" role="rowgroup">
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="row"
                      className="hs-row"
                      onClick={() => open(c.id)}
                      aria-label={`Abrir conversa: ${c.title}`}
                    >
                      <span className="hs-row-title" role="cell">
                        {c.title}
                      </span>

                      <span
                        role="cell"
                        className={`hs-status hs-status--${
                          c.status === "Resolvido" ? "done" : "open"
                        }`}
                      >
                        {c.status}
                      </span>

                      <span className="hs-date" role="cell">
                        {c.date}
                      </span>

                      <Arrow className="hs-go" />
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
