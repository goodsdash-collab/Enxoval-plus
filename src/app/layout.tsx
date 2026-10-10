import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SWRegister } from "@/components/SWRegister";

export const metadata: Metadata = {
  title: "Enxoval+ — Organize seu enxoval com carinho",
  description:
    "Checklist acolhedor para enxoval de casamento e bebê. Acompanhe o progresso e compartilhe com a família.",
  applicationName: "Enxoval+",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }], apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Enxoval+", statusBarStyle: "default" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#e8a0a0" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* App Android (TWA): o Chrome abre com referrer android-app://<pacote>; guardamos na sessionStorage
            para as próximas páginas. No app, escondemos menções a planos pagos (regras do Google Play). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var k="enxoval:twa";if(document.referrer.indexOf("android-app://br.com.enxovalplus.app")===0||/[?&]twa=1(&|$)/.test(location.search))sessionStorage.setItem(k,"1");if(sessionStorage.getItem(k)==="1")document.documentElement.classList.add("twa")}catch(e){}`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10 pt-6">{children}</main>
        <Footer />
        <SWRegister />
      </body>
    </html>
  );
}
