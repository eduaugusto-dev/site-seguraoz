import { createFileRoute } from "@tanstack/react-router";
import { JupiterPage } from "@/jupiter/JupiterPage";

export const Route = createFileRoute("/jupiter")({
  head: () => ({
    meta: [
      { title: "Júpiter — Chat de RH da SeguraOz" },
      {
        name: "description",
        content: "Converse com o Júpiter, o assistente de RH da SeguraOz: benefícios, ponto eletrônico, férias e folha de pagamento.",
      },
      { property: "og:title", content: "Júpiter — Chat de RH da SeguraOz" },
      { property: "og:description", content: "Tire suas dúvidas de RH conversando com o Júpiter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JupiterPage,
});
