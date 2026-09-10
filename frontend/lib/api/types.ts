/**
 * Mirror of backend DTOs. Checked against `/v3/api-docs` — if a field changes
 * there, it changes here.
 */

export type TipoPessoa = "FISICA" | "JURIDICA";
export type StatusAgendamento = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";
export type StatusPedido = "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type DocumentoResponse = {
  id: number;
  nome: string;
  createdAt: string;
};

export type DocumentoRequest = { nome: string };

export type CartorioResponse = {
  id: number;
  nome: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string | null;
  cidade: string;
  uf: string;
  documentos: DocumentoResponse[];
  totalDocumentos: number;
  createdAt: string;
};

export type CartorioRequest = {
  nome: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string | null;
  bairro?: string | null;
  cidade: string;
  uf: string;
  documentoIds: number[];
};

export type PedidoResponse = {
  id: number;
  numero: number;
  lead: string;
  observacao: string | null;
  status: StatusPedido;
  criadoPor: string;
  createdAt: string;
  totalAgendamentos: number;
};

/** Flat on purpose: matches the layout card exactly. */
export type AgendamentoResponse = {
  id: number;
  documentoNome: string;
  tipoPessoa: TipoPessoa;
  nomeRazaoSocial: string;
  documentoIdentificacao: string;
  dataNascimento: string | null;
  cartorioNome: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string | null;
  cidade: string;
  uf: string;
  status: StatusAgendamento;
  createdAt: string;
};

export type AgendamentoRequest = {
  cartorioId: number;
  documentoId: number;
  tipoPessoa: TipoPessoa;
  nomeRazaoSocial: string;
  documentoIdentificacao: string;
  dataNascimento?: string | null;
};
