import { createFileRoute } from "@tanstack/react-router";
import { HistoricoPage } from "@/historico/HistoricoPage";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — Conversas com o Júpiter | SeguraOz" },
      { name: "description", content: "Veja suas conversas anteriores com o Júpiter, com data e status de cada atendimento." },
      { property: "og:title", content: "Histórico — Conversas com o Júpiter" },
      { property: "og:description", content: "Suas conversas anteriores com o Júpiter, o assistente de RH da SeguraOz." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoricoPage,
});
