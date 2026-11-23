
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";

import logo from "@/assets/seguraoz-jupiter-logo.png";
import illustration from "@/assets/login-illustration.png";
import eyeClosed from "@/assets/eye-closed.png";
import eyeOpen from "@/assets/eye-open.png";

import { login } from "@/services/api";
import "@/styles/login.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — SeguraOz Júpiter" },
      {
        name: "description",
        content: "Acesse Júpiter, seu assistente de RH, em um ambiente seguro e confiável.",
      },
      { property: "og:title", content: "Entrar — SeguraOz Júpiter" },
      { property: "og:description", content: "Acesse Júpiter, seu assistente de RH." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const STORAGE_KEY = "jupiter_login_id";
const TOKEN_KEY = "jupiter_access_token";
const REFRESH_TOKEN_KEY = "jupiter_refresh_token";

const W = 1920;
const H = 1200;

function LoginPage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [blink, setBlink] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fit = () => {
      const el = stageRef.current;
      if (!el) return;

      if (window.innerWidth < 900) {
        el.style.transform = "";
        return;
      }

      const s = Math.min(window.innerWidth / W, window.innerHeight / H);
      el.style.transform = `translate(${(window.innerWidth - W * s) / 2}px, ${(window.innerHeight - H * s) / 2}px) scale(${s})`;
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUser(saved);
        setRemember(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (checked: boolean, value: string) => {
    try {
      if (checked) localStorage.setItem(STORAGE_KEY, value);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const toggleEye = () => {
    if (blink) return;

    setBlink(true);
    setTimeout(() => setShowPass((v) => !v), 140);
    setTimeout(() => setBlink(false), 330);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const username = user.trim();

    if (!username || !password) {
      setError("Informe sua matrícula ou e-mail e sua senha.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password);

      sessionStorage.setItem(TOKEN_KEY, result.access_token);
      sessionStorage.setItem(REFRESH_TOKEN_KEY, result.refresh_token);

      persist(remember, username);

      await navigate({ to: "/home" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível realizar o login. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="stage" ref={stageRef}>
        <img className="logo" src={logo} alt="SeguraOz Jupiter" />

        <h1 className="title">
          Bem-vindo ao seu
          <br />
          ambiente <span className="hl">seguro</span> e
          <br />
          confiável.
        </h1>

        <p className="subtitle">
          Acesse Jupiter, seu
          <br />
          assistente de RH.
        </p>

        <form className="form" onSubmit={onSubmit} autoComplete="on">
          <input
            className="field field-user"
            type="text"
            placeholder="Matrícula ou e-mail corporativo"
            value={user}
            autoComplete="username"
            disabled={loading}
            required
            onChange={(e) => {
              setUser(e.target.value);
              setError("");
              if (remember) persist(true, e.target.value);
            }}
          />

          <div className="field field-pass">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Senha"
              value={password}
              autoComplete="current-password"
              disabled={loading}
              required
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />

            <button
              type="button"
              className={`eye${showPass ? " is-open" : ""}${blink ? " blink" : ""}`}
              aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
              onClick={toggleEye}
              disabled={loading}
            >
              <img className="eye-img eye-closed" src={eyeClosed} alt="" />
              <img className="eye-img eye-open" src={eyeOpen} alt="" />
            </button>
          </div>

          <label className="remember">
            <input
              type="checkbox"
              checked={remember}
              disabled={loading}
              onChange={(e) => {
                setRemember(e.target.checked);
                persist(e.target.checked, user);
              }}
            />
            <span>Lembrar de mim</span>
          </label>

          {error && (
            <p role="alert" style={{ color: "#d32f2f" }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-main" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <img
          className="illustration"
          src={illustration}
          alt="Ilustração de acesso seguro"
        />

        <p className="footer">Protegido por SeguraOz©2026</p>
      </div>
    </div>
  );
}
