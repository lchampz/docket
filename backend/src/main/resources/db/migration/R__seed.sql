-- Seed de demonstração. Repetível e idempotente.
--
-- Os vínculos cartório × documento são DESIGUAIS de propósito: é o que dá o que
-- exercitar ao combo condicional. O Tabelionato de Porto Alegre não emite
-- nenhuma certidão — selecioná-lo tem que esvaziar a lista de certidões.
--
-- O pedido nasce SEM agendamentos, para o app abrir no empty state (ver docs D15).

INSERT INTO cartorio (id, nome, cep, rua, numero, complemento, bairro, cidade, uf) VALUES
  (1, '1º Ofício de Registro Civil',      '01302000', 'Rua da Consolação', '100',  NULL,       'Consolação',       'São Paulo',      'SP'),
  (2, '2º Ofício de Notas',               '20040901', 'Avenida Rio Branco', '156', 'Sala 1201','Centro',           'Rio de Janeiro', 'RJ'),
  (3, 'Cartório do 5º Ofício',            '30130921', 'Avenida Afonso Pena','1500', NULL,      'Centro',           'Belo Horizonte', 'MG'),
  (4, 'Tabelionato de Notas',             '90020008', 'Rua dos Andradas',  '1234', NULL,       'Centro Histórico', 'Porto Alegre',   'RS')
ON CONFLICT (id) DO NOTHING;

INSERT INTO documento (id, nome) VALUES
  (1, 'Certidão de Nascimento'),
  (2, 'Certidão de Casamento'),
  (3, 'Certidão de Óbito'),
  (4, 'Certidão de Interdição e Tutela'),
  (5, 'Escritura Pública'),
  (6, 'Procuração')
ON CONFLICT (id) DO NOTHING;

-- 1 emite tudo · 2 só as três certidões clássicas · 3 um recorte · 4 nenhuma certidão
INSERT INTO cartorio_documento (cartorio_id, documento_id) VALUES
  (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),
  (2,1),(2,2),(2,3),
  (3,1),(3,3),(3,6),
  (4,5),(4,6)
ON CONFLICT DO NOTHING;

INSERT INTO pedido (id, numero, lead, observacao, status, criado_por) VALUES
  (1, 1,
   'Documento para criar contrato',
   'Cliente precisa das certidões atualizadas para assinatura do contrato de locação. Prazo acordado de 15 dias corridos a partir da abertura do pedido. Solicitar segunda via sempre que a certidão emitida tiver mais de 90 dias.',
   'EM_ANDAMENTO',
   'João da Silva')
ON CONFLICT (id) DO NOTHING;

-- IDs explícitos não avançam a identity: sem isso o primeiro INSERT da aplicação colide.
SELECT setval(pg_get_serial_sequence('cartorio',  'id'), COALESCE((SELECT MAX(id) FROM cartorio),  1));
SELECT setval(pg_get_serial_sequence('documento', 'id'), COALESCE((SELECT MAX(id) FROM documento), 1));
SELECT setval(pg_get_serial_sequence('pedido',    'id'), COALESCE((SELECT MAX(id) FROM pedido),    1));
SELECT setval('pedido_numero_seq', COALESCE((SELECT MAX(numero) FROM pedido), 1));
