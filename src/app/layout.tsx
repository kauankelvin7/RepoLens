import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Onest } from "next/font/google";

import "./globals.css";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RepoLens — GitHub Repository Health",
  description:
    "Analise documentação, CI/CD, segurança, manutenção e sinais de engenharia de repositórios públicos do GitHub.",
  applicationName: "RepoLens",
  metadataBase: new URL("https://repolens-zeta.vercel.app"),
  openGraph: {
    title: "RepoLens",
    description: "Repository health, built on evidence.",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#07090e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${onest.variable} ${jetBrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
