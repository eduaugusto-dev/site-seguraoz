import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import logo from "@/assets/home/home-logo.webp.asset.json";
import logoutIcon from "@/assets/home/home-icon-logout.webp.asset.json";
import decoTop from "@/assets/home/home-deco-top.webp.asset.json";
import decoBottom from "@/assets/home/home-deco-bottom.webp.asset.json";
import woman from "@/assets/home/home-woman.webp.asset.json";
import man from "@/assets/home/home-man.webp.asset.json";
import arrow from "@/assets/home/home-arrow.webp.asset.json";
import { queueQuestion, startNewConversation } from "@/jupiter/chat";
import "./home.css";

const W = 1920;
const H = 1080;
const MOBILE = 900;

// Centro horizontal de cada item do menu no palco 1920 (medido na referência).
const NAV = [
  { id: "inicio", label: "Início", center: 480.5, pad: 75 },
  { id: "jupiter", label: "Júpiter", center: 719, pad: 32 },
  { id: "historico", label: "Histórico", center: 916.5, pad: 32 },
  { id: "documentos", label: "Documentos", center: 1157.5, pad: 32 },
  { id: "configuracoes", label: "Configurações", center: 1444.5, pad: 32 },
] as const;

type NavId = (typeof NAV)[number]["id"];

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function HomePage() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [active, setActive] = useState<NavId>("inicio");
  const [tab, setTab] = useState({ left: 357, width: 247 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Escala o palco 1920x1080 para a largura da tela (desktop/tablet).
  useIsoLayoutEffect(() => {
    const fit = () => {
      const page = pageRef.current;
      const stage = stageRef.current;
      if (!page || !stage) return;
      const vw = document.documentElement.clientWidth;
      if (window.innerWidth < MOBILE) {
        stage.style.transform = "";
        page.style.height = "";
      } else {
        const s = vw / W;
        stage.style.transform = `scale(${s})`;
        page.style.height = `${Math.max(H * s, window.innerHeight)}px`;
      }
      page.classList.add("is-ready");
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
      setTab({ left: item.center - width / 2, width });
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
  }, [active]);

  // A pergunta digitada na Home é enviada ao chat do Júpiter.
  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const text = query.trim();
    if (!text) return;
    startNewConversation();
    queueQuestion(text);
    navigate({ to: "/jupiter" });
  };

  return (
    <div className="hm-page" ref={pageRef}>
      <div className="hm-stage" ref={stageRef}>
        <div className="hm-corners" aria-hidden />
        <div className="hm-content-bg" aria-hidden />

        <header className="hm-topbar">
          <Link to="/home" className="hm-logo-link" aria-label="SeguraOz Júpiter — Início">
            <img className="hm-logo" src={logo.url} alt="SeguraOz Júpiter" />
          </Link>

          <nav className={`hm-nav${menuOpen ? " is-open" : ""}`} aria-label="Menu principal">
            <div className="hm-tab" style={{ left: tab.left, width: tab.width }} aria-hidden />
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                ref={(el) => {
                  itemRefs.current[n.id] = el;
                }}
                className={`hm-nav-item${active === n.id ? " is-active" : ""}`}
                style={{ left: n.center }}
                aria-current={active === n.id ? "page" : undefined}
                onClick={() => {
                  setMenuOpen(false);
                  if (n.id === "jupiter") {
                    navigate({ to: "/jupiter" });
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
                   if (n.id === "configuracoes") {
                     navigate({ to: "/configuracoes" });
                     return;
                   }
                  setActive(n.id);
                }}
              >
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          <Link to="/" className="hm-logout">
            <img src={logoutIcon.url} alt="" />
            <span>Sair</span>
          </Link>

          <button
            type="button"
            className={`hm-menu-btn${menuOpen ? " is-open" : ""}`}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <main className="hm-main">
          <section className="hm-card">
            <img className="hm-img hm-deco-bottom" src={decoBottom.url} alt="" />
            <img className="hm-img hm-deco-top" src={decoTop.url} alt="" />
            <img className="hm-img hm-man" src={man.url} alt="Pessoa usando notebook com balão de conversa" />

            <h1 className="hm-title">
              <span>Faça perguntas.</span>
              <span>Obtenha respostas.</span>
              <span>Encontre informações.</span>
            </h1>

            <form className="hm-search" role="search" onSubmit={onSearch}>
              <input
                className="hm-search-input"
                type="text"
                placeholder="Tire suas dúvidas com o Júpiter..."
                aria-label="Tire suas dúvidas com o Júpiter"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="hm-search-btn" aria-label="Enviar pergunta">
                <svg viewBox="0 0 73 73" fill="none" aria-hidden>
                  <path
                    d="M22 51L53 21M22 21H53V51"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>

            <img className="hm-img hm-arrow" src={arrow.url} alt="" />
            <img className="hm-img hm-woman" src={woman.url} alt="Pessoa trabalhando no notebook" />
          </section>
        </main>
      </div>
    </div>
  );
}
