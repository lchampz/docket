import { CartorioForm } from "@/components/cartorios/CartorioForm";

export default async function EditarCartorioPage(
  props: PageProps<"/cartorios/[id]/editar">,
) {
  const { id } = await props.params;
  return <CartorioForm cartorioId={Number(id)} />;
}
