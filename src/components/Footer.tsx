import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-rose-100/80 bg-white/50 mt-auto">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-stone-500">
        <p>
          Enxoval<span className="text-sage">+</span> · MVP · Plano Free = 1 enxoval
        </p>
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/precos" className="hover:text-rose-700">
            Preços
          </Link>
          <a href="/marketing/index.html" className="hover:text-rose-700">
            Sobre
          </a>
          <Link href="/" className="hover:text-rose-700">
            Início
          </Link>
        </nav>
      </div>
    </footer>
  );
}
