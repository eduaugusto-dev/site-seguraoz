import { createFileRoute } from "@tanstack/react-router";
import { ConfiguracoesPage } from "@/configuracoes/ConfiguracoesPage";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — SeguraOz Júpiter" },
      {
        name: "description",
        content: "Gerencie seu perfil, a aparência e as preferências do assistente Júpiter.",
      },
      { property: "og:title", content: "Configurações — SeguraOz Júpiter" },
      {
        property: "og:description",
        content: "Perfil, tema e idioma do Júpiter em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfiguracoesPage,
});
