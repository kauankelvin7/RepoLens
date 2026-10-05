import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "RepoLens — GitHub Repository Health",
  description:
    "Analise documentação, automação, segurança, manutenção e sinais de engenharia de qualquer repositório GitHub.",
  applicationName: "RepoLens",
  metadataBase: new URL("https://repolens.dev"),
  openGraph: {
    title: "RepoLens",
    description: "Repository health, without the hand-waving.",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#090b10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
