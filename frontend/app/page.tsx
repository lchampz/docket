import { PedidoScreen } from "@/components/pedido/PedidoScreen";
import { PedidoProvider } from "@/contexts/PedidoContext";
import { get } from "@/lib/api/client";
import type { PageResponse, PedidoResponse } from "@/lib/api/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const pedidos = await get<PageResponse<PedidoResponse>>("/pedidos?size=1");
  const pedido = pedidos.content[0];

  if (!pedido) {
    return (
      <main className="mx-auto max-w-7xl p-4 sm:p-8">
        <p className="text-body text-black60">Nenhum pedido encontrado.</p>
      </main>
    );
  }

  return (
    <PedidoProvider pedidoId={pedido.id}>
      <PedidoScreen />
    </PedidoProvider>
  );
}
