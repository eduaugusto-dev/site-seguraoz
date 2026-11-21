import { Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

import logo from "@/assets/home/home-logo.webp";
import logout from "@/assets/home/home-icon-logout.webp";
import people from "@/assets/documentos/documentos-pessoas.webp";
import headArrow from "@/assets/documentos/documentos-titulo-seta.webp";
import cardArrow from "@/assets/documentos/documentos-cartao-seta.webp";
import ferias from "@/assets/documentos/documentos-ferias.webp";
import folha from "@/assets/documentos/documentos-folha.webp";
import beneficios from "@/assets/documentos/documentos-beneficios.webp";
import licencas from "@/assets/documentos/documentos-licencas.webp";
import horas from "@/assets/documentos/documentos-banco-horas.webp";
import admissao from "@/assets/documentos/documentos-admissao.webp";
import desligamento from "@/assets/documentos/documentos-desligamento.webp";
import ponto from "@/assets/documentos/documentos-ponto.webp";

import "./documentos.css";

const DOCUMENTS = [
  { name: "Férias", date: "20/07/2026", icon: ferias },
  { name: "Folha de pagamento", date: "18/07/2026", icon: folha },
  { name: "Benefícios", date: "15/07/2026", icon: beneficios },
  { name: "Licenças", date: "10/07/2026", icon: licencas },
  { name: "Banco de horas", date: "12/07/2026", icon: horas },
  { name: "Admissão", date: "05/07/2026", icon: admissao },
  { name: "Desligamento", date: "02/07/2026", icon: desligamento },
  { name: "Ponto Eletrônico", date: "01/07/2026", icon: ponto },
];
const NAV = [
  { label: "Início", to: "/home", center: 408 },
  { label: "Júpiter", to: "/jupiter", center: 579.5 },
  { label: "Histórico", to: "/historico", center: 778 },
  { label: "Documentos", to: "/documentos", center: 1090.5 },
] as const;
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function DocumentosPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  useIsoLayoutEffect(() => {
    const fit = () => {
      const page = pageRef.current;
      const stage = stageRef.current;
      if (!page || !stage) return;
      const mobile = window.innerWidth < 900;
      const scale = document.documentElement.clientWidth / 1920;
      stage.style.transform = mobile ? "" : `scale(${scale})`;
      page.style.height = mobile ? "" : `${Math.max(1200 * scale, window.innerHeight)}px`;
      setReady(true);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(""), 3500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  return (
    <div className={`dc-page${ready ? " is-ready" : ""}`} ref={pageRef}>
      <div className="dc-stage" ref={stageRef}>
        <div className="dc-corners" aria-hidden />
        <div className="dc-content-bg" aria-hidden />
        <header className="dc-topbar">
          <Link to="/home" className="dc-logo-link" aria-label="SeguraOz Júpiter — Início">
            <img className="dc-logo" src={logo} alt="SeguraOz Júpiter" />
          </Link>
          <nav className={`dc-nav${menuOpen ? " is-open" : ""}`} aria-label="Menu principal">
            <div className="dc-tab" style={{ left: 908, width: 365 }} aria-hidden />
            {NAV.map((item) => (
              <Button asChild variant="ghost" key={item.to} className={`dc-nav-item${item.to === "/documentos" ? " is-active" : ""}`} style={{ left: item.center }}>
                <Link to={item.to} aria-current={item.to === "/documentos" ? "page" : undefined} onClick={() => setMenuOpen(false)}><span>{item.label}</span></Link>
              </Button>
            ))}
            <Button variant="ghost" className="dc-nav-item" style={{ left: 1439.5 }} onClick={() => { setMenuOpen(false); setFeedback("Configurações ainda não disponíveis."); }}><span>Configurações</span></Button>
          </nav>
          <Button asChild className="dc-logout"><Link to="/"><img src={logout} alt="" /><span>Sair</span></Link></Button>
          <Button variant="ghost" className={`dc-menu-btn${menuOpen ? " is-open" : ""}`} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></Button>
        </header>
        <main className="dc-main">
          <div className="dc-heading"><img className="dc-head-arrow" src={headArrow} alt="" /><h1 className="dc-title">Documentos RH</h1></div>
          <p className="dc-sub">Biblioteca inteligente de políticas e documentos de Recursos Humanos.</p>
          <img className="dc-people" src={people} alt="Duas pessoas trabalhando juntas em um computador" />
          <section className="dc-grid" aria-label="Documentos de Recursos Humanos">
            {DOCUMENTS.map((doc) => (
              <Button key={doc.name} variant="ghost" className="dc-card" aria-label={`Abrir ${doc.name}`} onClick={() => setFeedback(`${doc.name}: documento indisponível nesta demonstração.`)}>
                <svg className="dc-card-shape" viewBox="0 0 435 314" preserveAspectRatio="none" aria-hidden><path fill="currentColor" d="M199.911 25.551C202.42 30.719 207.661 34 213.405 34H420C428.284 34 435 40.716 435 49V289C435 302.807 423.807 314 410 314H25C11.1929 314 0 302.807 0 289V25C0 11.193 11.1929 0 25 0H178.115C183.86 0 189.1 3.281 191.609 8.449L199.911 25.551Z" /></svg>
                <img className="dc-icon" src={doc.icon} alt="" />
                <span className="dc-go" aria-hidden><img src={cardArrow} alt="" /></span>
                <span className="dc-card-text"><span className="dc-card-name">{doc.name === "Ponto Eletrônico" ? <>Ponto<br />Eletrônico</> : doc.name === "Folha de pagamento" ? <>Folha de<br />pagamento</> : doc.name}</span><span className="dc-card-date">Atualizado em {doc.date}</span></span>
              </Button>
            ))}
          </section>
        </main>
      </div>
      {feedback && <div className="dc-feedback" role="status">{feedback}</div>}
    </div>
  );
}