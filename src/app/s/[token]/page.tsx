import { ListView } from "@/components/ListView";

export default function SharePage({ params }: { params: { token: string } }) {
  return (
    <div>
      <p className="mb-4 text-center text-sm text-stone-500">
        Você está vendo uma lista compartilhada via Enxoval+
      </p>
      <ListView shareToken={params.token} />
    </div>
  );
}
