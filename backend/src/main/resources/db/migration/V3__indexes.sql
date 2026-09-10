-- Sem índice só de pedido_id: o composto abaixo já cobre, por prefixo à esquerda.
CREATE INDEX idx_agendamento_cartorio_id ON agendamento (cartorio_id);

CREATE INDEX idx_agendamento_documento_id ON agendamento (documento_id);

CREATE INDEX idx_cartorio_documento_documento_id ON cartorio_documento (documento_id);

CREATE INDEX idx_agendamento_pedido_id_created_at ON agendamento (pedido_id, created_at DESC);
