import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/home/HomePage";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Início — SeguraOz Júpiter" },
      {
        name: "description",
        content: "Faça perguntas, obtenha respostas e encontre informações com o Júpiter, o assistente de RH da SeguraOz.",
      },
      { property: "og:title", content: "Início — SeguraOz Júpiter" },
      { property: "og:description", content: "Tire suas dúvidas de RH com o Júpiter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
