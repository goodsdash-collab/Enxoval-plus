import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Enxoval+ — Organize seu enxoval com carinho",
  description:
    "Checklist acolhedor para enxoval de casamento e bebê. Acompanhe o progresso e compartilhe com a família.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10 pt-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
