import { ListView } from "@/components/ListView";

export default function ListaPage({ params }: { params: { id: string } }) {
  return <ListView listId={params.id} initialCanEdit />;
}
