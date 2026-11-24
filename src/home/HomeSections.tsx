import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowDownRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import bridge from "@/assets/home-sections/company-bridge.webp.asset.json";
import jupiterMark from "@/assets/home-sections/jupiter-mark.webp.asset.json";
import loopOne from "@/assets/home-sections/process-loop-one.webp.asset.json";
import loopTwo from "@/assets/home-sections/process-loop-two.webp.asset.json";
import loopThree from "@/assets/home-sections/process-loop-three.webp.asset.json";
import people from "@/assets/home-sections/jupiter-people.webp.asset.json";
import mission from "@/assets/home-sections/mission-trimmed.webp.asset.json";
import vision from "@/assets/home-sections/vision-trimmed.webp.asset.json";
import values from "@/assets/home-sections/values-trimmed.webp.asset.json";
import marks from "@/assets/home-sections/footer-marks.webp.asset.json";
import "./home-sections.css";

const steps = [
  ["Análise das necessidades", "Avaliação do perfil do cliente, seus bens, atividades e possíveis riscos envolvidos, evitando custos desnecessários e garantindo cobertura adequada."],
  ["Desenvolvimento de soluções personalizadas", "Apresentação de opções de seguros desenvolvidas para diferentes situações, buscando equilíbrio entre proteção, custo e benefícios."],
  ["Contratação e acompanhamento", "Suporte durante a contratação e acompanhamento contínuo da jornada do cliente."],
  ["Gestão de sinistros", "Apoio na comunicação, documentação e acompanhamento do atendimento junto às seguradoras em caso de sinistro."],
];
const differences = [
  ["Entende a intenção do usuário", "Considera o significado da pergunta, não apenas palavras isoladas, para identificar a informação que o colaborador procura."],
  ["Responde conforme conhecimento buscado na base da empresa", "Consulta os conteúdos internos da SeguraOz para orientar respostas alinhadas às informações da empresa."],
  ["Recuperação de dados conforme injeção de contexto e geração de respostas. O que reduz erros, mantém os dados atualizados e tem foco interno.", "Usa o contexto encontrado na base de conhecimento para elaborar respostas relevantes, reduzindo a dependência de informações genéricas."],
  ["Respostas personalizadas conforme o colaborador.", "O contexto do colaborador pode direcionar a resposta às informações pertinentes à sua situação."],
  ["Autenticação + Autorização para ver os dados", "O acesso às informações deve respeitar a identificação do usuário e as permissões concedidas pela empresa."],
  ["Conversa + decisão de resposta + ferramentas", "Combina o contexto da conversa com a escolha das informações e ferramentas adequadas para cada solicitação."],
  ["Busca contexto antes de responder", "Procura informações relacionadas à pergunta antes de elaborar uma resposta, mantendo o foco no assunto solicitado."],
];
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function HomeSections() {
  const wrapper = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<number[]>([]);
  useIsoLayoutEffect(() => {
    const fit = () => {
      if (!wrapper.current || !stage.current) return;
      if (window.innerWidth < 900) {
        stage.current.style.transform = "";
        wrapper.current.style.height = "";
      } else {
        const scale = wrapper.current.clientWidth / 1920;
        stage.current.style.transform = `scale(${scale})`;
        wrapper.current.style.height = `${stage.current.offsetHeight * scale}px`;
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    if (stage.current) observer.observe(stage.current);
    window.addEventListener("resize", fit);
    return () => { observer.disconnect(); window.removeEventListener("resize", fit); };
  }, []);

  return <div className="hm-sections" ref={wrapper}><div className="hm-sections-stage" ref={stage}>
    <section className="hm-company" aria-labelledby="hm-company-title">
      <h2 id="hm-company-title">Conheça a<br />nossa <mark>empresa</mark></h2>
      <p className="hm-company-subtitle">Inovação, compromisso e pessoas. É isso que nos inspira a evoluir todos os dias.</p>
      <div className="hm-company-grid">
        <article className="hm-company-copy"><header><ArrowDownRight aria-hidden /><h3>Empresa<br />SeguraOz</h3></header><p>A SeguraOz oferece soluções personalizadas de seguros para pessoas e empresas, conectando clientes às melhores opções de proteção. Seu objetivo é garantir segurança, tranquilidade e praticidade, com atendimento próximo e soluções confiáveis.</p></article>
        <div className="hm-company-art hm-company-art-blue" aria-hidden><img src={bridge.url} alt="" loading="lazy" /></div>
        <div className="hm-company-art hm-company-art-green" aria-hidden><img src={jupiterMark.url} alt="" loading="lazy" /></div>
        <article className="hm-company-copy hm-agent-copy"><header><h3>Agente<br />Júpiter</h3><ArrowDownRight aria-hidden /></header><p>O Júpiter é o assistente inteligente de RH da SeguraOz, criado para facilitar o acesso rápido e seguro a informações internas, como férias, benefícios, folha de pagamento e políticas, agilizando o atendimento aos colaboradores e reduzindo a demanda operacional do RH.</p></article>
      </div>
    </section>
    <section className="hm-process" aria-labelledby="hm-process-title">
      <h2 id="hm-process-title">Conheça nossa forma<br />de trabalhar</h2>
      <div className="hm-process-panel">
        <img className="hm-process-loop hm-loop-one" src={loopOne.url} alt="" loading="lazy" />
        <img className="hm-process-loop hm-loop-two" src={loopTwo.url} alt="" loading="lazy" />
        <img className="hm-process-loop hm-loop-three" src={loopThree.url} alt="" loading="lazy" />
        {steps.map(([title, text]) => <article className="hm-process-row" key={title}><ArrowDownRight aria-hidden /><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </section>
    <section className="hm-differences" aria-labelledby="hm-differences-title">
      <div><h2 id="hm-differences-title">O que <mark>diferencia</mark><br />Júpiter de um simples chatbot?</h2><div className="hm-differences-art"><img src={people.url} alt="Ilustração de análise de informações e atendimento aos colaboradores" loading="lazy" /></div></div>
      <div className="hm-differences-list">{differences.map(([title, answer], index) => {
        const open = expanded.includes(index);
        return <div className="hm-difference-item" key={title}>
          <Button variant="ghost" className="hm-difference-toggle" id={`hm-question-${index}`} aria-expanded={open} aria-controls={`hm-answer-${index}`} onClick={() => setExpanded(current => current.includes(index) ? current.filter(item => item !== index) : [...current, index])}>
            <span>{title}</span><span className="hm-difference-icon"><ArrowDown aria-hidden /></span>
          </Button>
          <div id={`hm-answer-${index}`} role="region" aria-labelledby={`hm-question-${index}`} hidden={!open}><p className="hm-difference-answer">{answer}</p></div>
        </div>;
      })}</div>
    </section>
    <section className="hm-values" aria-labelledby="hm-values-title">
      <img className="hm-values-backdrop" src={bridge.url} alt="" loading="lazy" />
      <h2 id="hm-values-title">Missão, visão<br />e valores</h2>
      <div className="hm-timeline">
        <article className="hm-timeline-row"><div className="hm-timeline-picture"><img src={mission.url} alt="Colaboradora apontando para um alvo" loading="lazy" /></div><span className="hm-timeline-node" aria-hidden><ChevronDown /></span><div className="hm-timeline-copy"><h3>Nossa Missão</h3><p>Proporcionar segurança e tranquilidade aos clientes por meio de soluções de seguros confiáveis, atendimento humanizado e gestão eficiente dos riscos.</p></div></article>
        <article className="hm-timeline-row"><div className="hm-timeline-copy"><h3>Nossa Visão</h3><p>Ser reconhecida como referência no mercado, destacando-se pela confiança, qualidade e capacidade de oferecer soluções adequadas para cada cliente.</p></div><span className="hm-timeline-node" aria-hidden><ChevronDown /></span><div className="hm-timeline-picture"><img src={vision.url} alt="Colaborador observando uma montanha com uma bandeira" loading="lazy" /></div></article>
        <article className="hm-timeline-row"><div className="hm-timeline-picture"><img src={values.url} alt="Equipe reunida em colaboração" loading="lazy" /></div><span className="hm-timeline-node" aria-hidden><ChevronDown /></span><div className="hm-timeline-copy"><h3>Nossos Valores</h3><p>A SeguraOz atua com confiança, compromisso, excelência, inovação e humanização, oferecendo proteção de qualidade, soluções inovadoras e uma experiência centrada nas necessidades de pessoas, famílias e negócios.</p></div></article>
      </div>
    </section>
    <footer className="hm-home-footer"><img src={marks.url} alt="SeguraOz e Júpiter" loading="lazy" /><p>SeguraOz, proteção inteligente<br />para todos os momentos da vida.</p><small>Protegido por SeguraOz ©2026</small></footer>
  </div></div>;
}