import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PedidoProvider, usePedido } from "./PedidoContext";
import * as client from "@/lib/api/client";
import type { DocumentoResponse } from "@/lib/api/types";

vi.mock("@/lib/api/client", () => ({
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn(),
}));

const docsCartorio4: DocumentoResponse[] = [
  { id: 5, nome: "Escritura Pública", createdAt: "2024-01-01T00:00:00Z" },
  { id: 6, nome: "Procuração", createdAt: "2024-01-01T00:00:00Z" },
];

const docsCartorio1: DocumentoResponse[] = [
  { id: 1, nome: "Certidão de Nascimento", createdAt: "2024-01-01T00:00:00Z" },
];

function ComboProbe() {
  const { documentosDoCartorio, loadDocumentosDoCartorio } = usePedido();
  const [documentoId, setDocumentoId] = useState("");

  async function trocarCartorio(cartorioId: number | null) {
    setDocumentoId("");
    await loadDocumentosDoCartorio(cartorioId);
  }

  return (
    <div>
      <button type="button" onClick={() => void trocarCartorio(4)}>
        cartorio-4
      </button>
      <button type="button" onClick={() => void trocarCartorio(1)}>
        cartorio-1
      </button>
      <button type="button" onClick={() => void trocarCartorio(null)}>
        limpar
      </button>
      <ul data-testid="docs">
        {documentosDoCartorio.map((d) => (
          <li key={d.id}>{d.nome}</li>
        ))}
      </ul>
      <select
        data-testid="documentoId"
        value={documentoId}
        onChange={(e) => setDocumentoId(e.target.value)}
      >
        <option value="">Selecione</option>
        {documentosDoCartorio.map((d) => (
          <option key={d.id} value={String(d.id)}>
            {d.nome}
          </option>
        ))}
      </select>
    </div>
  );
}

describe("PedidoContext — combo condicional", () => {
  beforeEach(() => {
    vi.mocked(client.get).mockImplementation(async (path: string) => {
      if (path.startsWith("/pedidos/1") && !path.includes("agendamentos")) {
        return {
          id: 1,
          numero: 1,
          lead: "Lead",
          observacao: null,
          status: "EM_ANDAMENTO",
          criadoPor: "Teste",
          totalAgendamentos: 0,
          createdAt: "2024-01-01T00:00:00Z",
        };
      }
      if (path.startsWith("/pedidos/1/agendamentos")) {
        return { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
      }
      if (path === "/cartorios?size=100") {
        return { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 };
      }
      if (path === "/cartorios/4/documentos") return docsCartorio4;
      if (path === "/cartorios/1/documentos") return docsCartorio1;
      throw new Error(`unexpected path ${path}`);
    });
  });

  it("trocar de cartório recarrega a lista e limpa a seleção de documento", async () => {
    const user = userEvent.setup();
    render(
      <PedidoProvider pedidoId={1}>
        <ComboProbe />
      </PedidoProvider>,
    );

    await waitFor(() => expect(client.get).toHaveBeenCalled());

    await user.click(screen.getByText("cartorio-4"));
    await waitFor(() =>
      expect(screen.getByTestId("docs")).toHaveTextContent("Escritura Pública"),
    );

    await user.selectOptions(screen.getByTestId("documentoId"), "5");
    expect((screen.getByTestId("documentoId") as HTMLSelectElement).value).toBe("5");

    await user.click(screen.getByText("cartorio-1"));
    await waitFor(() =>
      expect(screen.getByTestId("docs")).toHaveTextContent("Certidão de Nascimento"),
    );
    expect((screen.getByTestId("documentoId") as HTMLSelectElement).value).toBe("");

    await user.click(screen.getByText("limpar"));
    await waitFor(() => expect(screen.getByTestId("docs")).toBeEmptyDOMElement());
  });
});
