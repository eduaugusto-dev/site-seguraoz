import { createFileRoute } from "@tanstack/react-router";
import { DocumentosPage } from "@/documentos/DocumentosPage";

export const Route = createFileRoute("/documentos")({
  head: () => ({ meta: [
    { title: "Documentos RH — SeguraOz Júpiter" },
    { name: "description", content: "Biblioteca inteligente de políticas e documentos de Recursos Humanos da SeguraOz." },
    { property: "og:title", content: "Documentos RH — SeguraOz Júpiter" },
    { property: "og:description", content: "Consulte a biblioteca de férias, benefícios, folha de pagamento e políticas de RH da SeguraOz." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DocumentosPage,
});