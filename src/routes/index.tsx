import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import logo from "@/assets/seguraoz-jupiter-logo.png.asset.json";
import illustration from "@/assets/login-illustration.png.asset.json";
import eyeClosed from "@/assets/eye-closed.png.asset.json";
import eyeOpen from "@/assets/eye-open.png.asset.json";
import "@/styles/login.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — SeguraOz Júpiter" },
      { name: "description", content: "Acesse Júpiter, seu assistente de RH, em um ambiente seguro e confiável." },
      { property: "og:title", content: "Entrar — SeguraOz Júpiter" },
      { property: "og:description", content: "Acesse Júpiter, seu assistente de RH." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const STORAGE_KEY = "jupiter_login_id";
const W = 1920;
const H = 1200;

function LoginPage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [showPass, setShowPass] = useState(false);
  const [blink, setBlink] = useState(false);
  const [user, setUser] = useState("");
  const [remember, setRemember] = useState(false);

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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    persist(remember, user);
  };

  return (
    <div className="login-page">
      <div className="stage" ref={stageRef}>
        <img className="logo" src={logo.url} alt="SeguraOz Jupiter" />
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
            onChange={(e) => {
              setUser(e.target.value);
              if (remember) persist(true, e.target.value);
            }}
          />
          <div className="field field-pass">
            <input type={showPass ? "text" : "password"} placeholder="Senha" />
            <button
              type="button"
              className={`eye${showPass ? " is-open" : ""}${blink ? " blink" : ""}`}
              aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
              onClick={toggleEye}
            >
              <img className="eye-img eye-closed" src={eyeClosed.url} alt="" />
              <img className="eye-img eye-open" src={eyeOpen.url} alt="" />
            </button>
          </div>
          <label className="remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => {
                setRemember(e.target.checked);
                persist(e.target.checked, user);
              }}
            />
            <span>Lembrar de mim</span>
          </label>
          <button type="submit" className="btn-main">
            Entrar
          </button>
        </form>

        <img className="illustration" src={illustration.url} alt="Ilustração de acesso seguro" />
        <p className="footer">Protegido por SeguraOz©2026</p>
      </div>
    </div>
  );
}
