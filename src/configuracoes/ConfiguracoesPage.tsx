
import { Link, useNavigate } from "@tanstack/react-router";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
} from "react";

import logo from "@/assets/home/home-logo.webp.asset.json";
import logoutIcon from "@/assets/home/home-icon-logout.webp.asset.json";
import iconPerfil from "@/assets/configuracoes/icone-perfil.webp.asset.json";
import iconTinta from "@/assets/configuracoes/icone-tinta.webp.asset.json";
import iconPreferencias from "@/assets/configuracoes/icone-preferencias.webp.asset.json";
import iconEmail from "@/assets/configuracoes/icone-email.webp.asset.json";
import iconTelefone from "@/assets/configuracoes/icone-telefone.webp.asset.json";
import iconLapis from "@/assets/configuracoes/icone-lapis.webp.asset.json";
import iconSol from "@/assets/configuracoes/icone-sol.webp.asset.json";
import iconLua from "@/assets/configuracoes/icone-lua.webp.asset.json";
import iconMonitor from "@/assets/configuracoes/icone-monitor.webp.asset.json";
import marcaAgua from "@/assets/configuracoes/marca-agua.webp.asset.json";
import avatar from "@/assets/configuracoes/avatar.webp.asset.json";

import { getMyProfile } from "@/services/api";

import {
  LANGUAGES,
  applyTheme,
  getLanguage,
  getProfile,
  getTheme,
  getVersion,
  saveProfile,
  setLanguage,
  setTheme,
  subscribe,
  watchSystemTheme,
  setProfileFromApi,
  type Profile,
  type Theme,
} from "./settings";

import "./configuracoes.css";

const W = 1920;
const H = 1695;
const MOBILE = 900;

// Centro de cada item do menu no palco 1920.
const NAV = [
  { id: "inicio", label: "Início", center: 444.5, pad: 32 },
  { id: "jupiter", label: "Júpiter", center: 615.5, pad: 32 },
  { id: "historico", label: "Histórico", center: 813, pad: 32 },
  { id: "documentos", label: "Documentos", center: 1054, pad: 32 },
  {
    id: "configuracoes",
    label: "Configurações",
    center: 1382.5,
    pad: 58,
    tabCenter: 1386,
  },
] as const;

type NavId = (typeof NAV)[number]["id"];

const THEMES: { id: Theme; label: string; icon: typeof iconSol }[] = [
  { id: "claro", label: "Claro", icon: iconSol },
  { id: "escuro", label: "Escuro", icon: iconLua },
  { id: "sistema", label: "Sistema", icon: iconMonitor },
];

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Seta diagonal usada nos títulos e cartões. */
function Arrow({
  className,
  down,
  strokeWidth = 8,
}: {
  className: string;
  down?: boolean;
  strokeWidth?: number;
}) {
  return (
    <svg className={className} viewBox="0 0 84 84" fill="none" aria-hidden>
      <path
        d={down ? "M8 8L76 76M8 76H76V8" : "M10 74L76 8M10 8H76V74"}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
    </svg>
  );
}

export function ConfiguracoesPage() {
  const navigate = useNavigate();

  const pageRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [active, setActive] = useState<NavId>("configuracoes");
  const [tab, setTab] = useState({ left: 1201, width: 370 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile>(getProfile());

  // Estado de carregamento do perfil vindo da API.
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Estado local da sessão: Perfil, Aparência e Preferências.
  useSyncExternalStore(subscribe, getVersion, getVersion);

  const profile = getProfile();
  const theme = getTheme();
  const language = getLanguage();

  // Recupera os dados reais do colaborador autenticado.
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setProfileLoading(true);
        setProfileError(null);

const data = await getMyProfile();

console.log("PERFIL RECEBIDO DA API:", data);

console.log(
  "TOKEN DA SESSÃO:",
  sessionStorage.getItem("jupiter_access_token")
);

        if (cancelled) return;

        setProfileFromApi({
          nome: data.nome,
          email: data.email,
          cargo: data.cargo,
        });
      } catch (error) {
        if (cancelled) return;

        console.error("Erro ao carregar perfil:", error);

        setProfileError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados do colaborador."
        );
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  // Aplica o tema selecionado.
  useIsoLayoutEffect(() => {
    applyTheme(getTheme());
    return watchSystemTheme();
  }, []);

  // Escala o palco 1920x1695 para a largura da tela.
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

  // Posiciona a aba branca sob o item ativo do menu.
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

  // Inicia a edição dos dados locais permitidos.
  const startEdit = () => {
    setDraft(getProfile());
    setEditing(true);
  };

  const cancel = () => {
    setDraft(getProfile());
    setEditing(false);
  };

  // Salva somente o telefone, pois nome e e-mail vêm da API.
  const save = () => {
    saveProfile(draft);
    setEditing(false);
  };

  const editField =
    (key: "telefone") => (e: ChangeEvent<HTMLInputElement>) =>
      setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div
      className={`cf-page${ready ? " is-ready" : ""}${editing ? " is-editing" : ""}`}
      ref={pageRef}
    >
      <div className="cf-stage" ref={stageRef}>
        <div className="cf-content-bg" aria-hidden />

        <header className="cf-topbar">
          <Link
            to="/home"
            className="cf-logo-link"
            aria-label="SeguraOz Júpiter — Início"
          >
            <img className="cf-logo" src={logo.url} alt="SeguraOz Júpiter" />
          </Link>

          <nav
            className={`cf-nav${menuOpen ? " is-open" : ""}`}
            aria-label="Menu principal"
          >
            <div
              className="cf-tab"
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
                className={`cf-nav-item${active === n.id ? " is-active" : ""}`}
                style={{ left: n.center }}
                aria-current={active === n.id ? "page" : undefined}
                onClick={() => {
                  setMenuOpen(false);

                  if (n.id === "inicio") navigate({ to: "/home" });
                  else if (n.id === "jupiter") navigate({ to: "/jupiter" });
                  else if (n.id === "historico") navigate({ to: "/historico" });
                  else if (n.id === "documentos") navigate({ to: "/documentos" });
                  else setActive(n.id);
                }}
              >
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          <Link to="/" className="cf-logout">
            <img src={logoutIcon.url} alt="" />
            <span>Sair</span>
          </Link>

          <button
            type="button"
            className={`cf-menu-btn${menuOpen ? " is-open" : ""}`}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <div className="cf-head">
          <Arrow className="cf-head-arrow" down strokeWidth={9} />

          <h1 className="cf-title">Configurações</h1>

          <p className="cf-sub">
            Gerencie sua conta, aparência e suas preferências do Júpiter.
          </p>
        </div>

        <section
          className="cf-card cf-card--perfil"
          aria-labelledby="cf-perfil-title"
        >
          <img className="cf-card-icon" src={iconPerfil.url} alt="" />

          <h2 className="cf-card-title" id="cf-perfil-title">
            Perfil
          </h2>

          <img
            className="cf-avatar"
            src={avatar.url}
            alt="Ilustração de pessoa trabalhando em um notebook"
          />

          {profileLoading ? (
            <p className="cf-name">Carregando perfil...</p>
          ) : editing ? (
            <input
              className="cf-name-input"
              value={draft.nome}
              readOnly
              aria-label="Nome do colaborador"
            />
          ) : (
            <p className="cf-name">
              {profile.nome || "Nome não informado"}
            </p>
          )}

          <p className="cf-role">
            {profileLoading
              ? "Carregando..."
              : profile.cargo || "Cargo não informado"}
          </p>

          {profileError && (
            <p className="cf-profile-error" role="alert">
              Não foi possível carregar seu perfil: {profileError}
            </p>
          )}

          <div className="cf-field">
            <img className="cf-field-icon" src={iconEmail.url} alt="" />

            <span className="cf-field-label">E-mail</span>

            {editing ? (
              <input
                className="cf-field-input"
                type="email"
                value={draft.email}
                readOnly
                aria-label="E-mail"
              />
            ) : (
              <span className="cf-field-value">
                {profileLoading
                  ? "Carregando..."
                  : profile.email || "E-mail não informado"}
              </span>
            )}
          </div>

          <div className="cf-field">
            <img className="cf-field-icon" src={iconTelefone.url} alt="" />

            <span className="cf-field-label">Telefone</span>

            {editing ? (
              <input
                className="cf-field-input"
                type="tel"
                value={draft.telefone}
                onChange={editField("telefone")}
                aria-label="Telefone"
              />
            ) : (
              <span className="cf-field-value">
                {profile.telefone || "Não informado"}
              </span>
            )}
          </div>

          <button
            type="button"
            className="cf-edit"
            onClick={startEdit}
            disabled={profileLoading || Boolean(profileError)}
          >
            <img className="cf-edit-icon" src={iconLapis.url} alt="" />
            <span>Editar perfil</span>
          </button>
        </section>

        <section
          className="cf-card cf-card--aparencia"
          aria-labelledby="cf-aparencia-title"
        >
          <img className="cf-card-icon" src={iconTinta.url} alt="" />

          <h2 className="cf-card-title" id="cf-aparencia-title">
            Aparência
          </h2>

          <p className="cf-label">Tema</p>

          <div className="cf-themes" role="radiogroup" aria-label="Tema">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={theme === t.id}
                className={`cf-theme${theme === t.id ? " is-on" : ""}`}
                onClick={() => setTheme(t.id)}
              >
                <img src={t.icon.url} alt="" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section
          className="cf-card cf-card--preferencias"
          aria-labelledby="cf-pref-title"
        >
          <img
            className="cf-watermark"
            src={marcaAgua.url}
            alt=""
            aria-hidden
          />

          <img className="cf-card-icon" src={iconPreferencias.url} alt="" />

          <h2 className="cf-card-title" id="cf-pref-title">
            Preferências
          </h2>

          <p className="cf-label">Idioma</p>

          <div className="cf-select">
            <select
              aria-label="Idioma"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>

            <svg
              className="cf-chevron"
              viewBox="0 0 46 21"
              fill="none"
              aria-hidden
            >
              <path
                d="M2 2L23 19L44 2"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <Arrow className="cf-card-arrow" />
        </section>

        <footer className="cf-footer">
          <button
            type="button"
            className="cf-cancel"
            onClick={cancel}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="cf-save"
            onClick={save}
            disabled={!editing}
          >
            Salvar alterações
          </button>
        </footer>
      </div>
    </div>
  );
}
