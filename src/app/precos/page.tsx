import Link from "next/link";

export default function PrecosPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center pt-2">
        <h1 className="font-display text-3xl text-rose-800">Planos</h1>
        <p className="twa-hide mt-2 text-stone-600">
          Free = 1 enxoval. Pro = R$19,90/mês. Pagamentos reais em breve.
        </p>
        <p className="twa-only mt-2 text-stone-600">O Enxoval+ é gratuito: cada conta tem 1 enxoval completo.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="card-soft p-6 border-2 border-rose-200">
          <p className="text-sm font-medium text-rose-500 uppercase tracking-wide">Free</p>
          <p className="mt-2 font-display text-3xl text-rose-900">R$ 0</p>
          <p className="mt-1 text-xs text-stone-500">Ideal para começar</p>
          <ul className="mt-4 space-y-2 text-sm text-stone-600">
            <li>✓ <strong>1 enxoval</strong> (Casamento ou Bebê)</li>
            <li>✓ Templates completos</li>
            <li>✓ Progresso e itens urgentes</li>
            <li>✓ Compartilhar (leitura e edição)</li>
            <li>✓ Modo convidado ou conta</li>
          </ul>
          <Link href="/" className="btn-secondary mt-6 w-full text-center">
            Continuar grátis
          </Link>
        </div>

        <div className="twa-hide card-soft p-6 border-2 border-rose-300 relative overflow-hidden">
          <span className="absolute top-3 right-3 rounded-full bg-rose-400 text-white text-xs px-2 py-0.5">
            Em breve
          </span>
          <p className="text-sm font-medium text-rose-500 uppercase tracking-wide">Pro</p>
          <p className="mt-2 font-display text-3xl text-rose-900">
            R$19,90<span className="text-base font-sans text-stone-500">/mês</span>
          </p>
          <p className="mt-1 text-xs text-stone-500">Sem cobrança neste MVP</p>
          <ul className="mt-4 space-y-2 text-sm text-stone-600">
            <li>✓ Enxovais ilimitados</li>
            <li>✓ Vários checklists ao mesmo tempo</li>
            <li>✓ Compartilhar com edição</li>
            <li>✓ Prioridade no suporte</li>
          </ul>
          <button disabled className="btn-primary mt-6 w-full opacity-70 cursor-not-allowed">
            Em breve — sem pagamento ainda
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-stone-500">
        Quer conhecer a história do produto?{" "}
        <a href="/marketing/index.html" className="text-rose-600 underline hover:text-rose-800">
          Sobre o Enxoval+
        </a>
      </p>

      <p className="twa-hide text-center text-xs text-stone-400">
        UI de preços apenas — sem cobrança real neste MVP. Limite Free já é aplicado na criação de
        listas.
      </p>
    </div>
  );
}
