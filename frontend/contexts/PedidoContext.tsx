"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { del, get, post } from "@/lib/api/client";
import type {
  AgendamentoRequest,
  AgendamentoResponse,
  CartorioResponse,
  DocumentoResponse,
  PageResponse,
  PedidoResponse,
} from "@/lib/api/types";

const PAGE_SIZE = 10;

type PedidoContextValue = {
  pedido: PedidoResponse | null;
  agendamentos: AgendamentoResponse[];
  total: number;
  page: number;
  totalPages: number;
  cartorios: CartorioResponse[];
  /** Documentos que o cartório selecionado emite. Vazio até escolher um. */
  documentosDoCartorio: DocumentoResponse[];
  loadingList: boolean;
  loadingDocumentos: boolean;
  saving: boolean;
  goToPage: (page: number) => void;
  loadDocumentosDoCartorio: (cartorioId: number | null) => Promise<void>;
  createAgendamento: (data: AgendamentoRequest) => Promise<void>;
  deleteAgendamento: (id: number) => Promise<void>;
};

const Context = createContext<PedidoContextValue | null>(null);

/**
 * Estado do pedido atual: cabeçalho, agendamentos e dados dos combos.
 *
 * <p>A contagem do título, a lista e o formulário leem a <strong>mesma</strong>
 * fonte. Manter cópia local em cada um é o caminho curto para a contagem
 * divergir do servidor após erro parcial.
 *
 * <p>Toast fica em outro provider ({@link ToastContext}) para esta árvore não
 * re-renderizar a cada notificação.
 */
export function PedidoProvider({
  pedidoId,
  children,
}: {
  pedidoId: number;
  children: ReactNode;
}) {
  const [pedido, setPedido] = useState<PedidoResponse | null>(null);
  const [agendamentos, setAgendamentos] = useState<AgendamentoResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [cartorios, setCartorios] = useState<CartorioResponse[]>([]);
  const [documentosDoCartorio, setDocumentosDoCartorio] = useState<DocumentoResponse[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadList = useCallback(
    async (targetPage: number) => {
      setLoadingList(true);
      try {
        const [header, pageData] = await Promise.all([
          get<PedidoResponse>(`/pedidos/${pedidoId}`),
          get<PageResponse<AgendamentoResponse>>(
            `/pedidos/${pedidoId}/agendamentos?page=${targetPage}&size=${PAGE_SIZE}`,
          ),
        ]);
        setPedido(header);
        setAgendamentos(pageData.content);
        setTotal(pageData.totalElements);
        setTotalPages(pageData.totalPages);
        // A página pedida pode não existir mais após exclusão.
        setPage(
          pageData.totalPages > 0 && targetPage >= pageData.totalPages
            ? pageData.totalPages - 1
            : targetPage,
        );
      } finally {
        setLoadingList(false);
      }
    },
    [pedidoId],
  );

  useEffect(() => {
    void loadList(0);
    void get<PageResponse<CartorioResponse>>("/cartorios?size=100").then((p) =>
      setCartorios(p.content),
    );
  }, [loadList]);

  const goToPage = useCallback(
    (target: number) => {
      void loadList(target);
    },
    [loadList],
  );

  /**
   * Coração do combo condicional: a lista de documentos vem sempre do cartório
   * escolhido, nunca do catálogo inteiro. Sem cartório ela some — mostrar a
   * lista completa aqui é o que gera agendamentos inválidos.
   */
  const loadDocumentosDoCartorio = useCallback(async (cartorioId: number | null) => {
    if (cartorioId === null) {
      setDocumentosDoCartorio([]);
      return;
    }
    setLoadingDocumentos(true);
    try {
      setDocumentosDoCartorio(
        await get<DocumentoResponse[]>(`/cartorios/${cartorioId}/documentos`),
      );
    } finally {
      setLoadingDocumentos(false);
    }
  }, []);

  const createAgendamento = useCallback(
    async (data: AgendamentoRequest) => {
      setSaving(true);
      try {
        await post<AgendamentoResponse>(`/pedidos/${pedidoId}/agendamentos`, data);
        // Recarrega em vez de empurrar localmente: contagem e paginação vêm do
        // servidor, que sabe a verdade.
        await loadList(0);
      } finally {
        setSaving(false);
      }
    },
    [pedidoId, loadList],
  );

  const deleteAgendamento = useCallback(
    async (id: number) => {
      await del(`/agendamentos/${id}`);
      await loadList(page);
    },
    [loadList, page],
  );

  const value = useMemo<PedidoContextValue>(
    () => ({
      pedido,
      agendamentos,
      total,
      page,
      totalPages,
      cartorios,
      documentosDoCartorio,
      loadingList,
      loadingDocumentos,
      saving,
      goToPage,
      loadDocumentosDoCartorio,
      createAgendamento,
      deleteAgendamento,
    }),
    [
      pedido,
      agendamentos,
      total,
      page,
      totalPages,
      cartorios,
      documentosDoCartorio,
      loadingList,
      loadingDocumentos,
      saving,
      goToPage,
      loadDocumentosDoCartorio,
      createAgendamento,
      deleteAgendamento,
    ],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function usePedido() {
  const value = useContext(Context);
  if (!value) throw new Error("usePedido must be used within <PedidoProvider>");
  return value;
}
