CREATE UNIQUE INDEX uk_documento_nome_lower ON documento (lower(nome));

ALTER TABLE cartorio
    ADD CONSTRAINT chk_cartorio_cep
        CHECK (cep ~ '^[0-9]{8}$');

ALTER TABLE cartorio
    ADD CONSTRAINT chk_cartorio_uf
        CHECK (uf IN (
            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
            'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
            'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
        ));

ALTER TABLE pedido
    ADD CONSTRAINT chk_pedido_status
        CHECK (status IN ('EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'));

ALTER TABLE agendamento
    ADD CONSTRAINT chk_agendamento_status
        CHECK (status IN ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'));

ALTER TABLE agendamento
    ADD CONSTRAINT chk_agendamento_tipo_pessoa
        CHECK (tipo_pessoa IN ('FISICA', 'JURIDICA'));

ALTER TABLE agendamento
    ADD CONSTRAINT chk_agendamento_documento_identificacao
        CHECK (
            (tipo_pessoa = 'FISICA' AND length(documento_identificacao) = 11)
            OR (tipo_pessoa = 'JURIDICA' AND length(documento_identificacao) = 14)
        );

ALTER TABLE agendamento
    ADD CONSTRAINT chk_agendamento_data_nascimento
        CHECK (data_nascimento IS NULL OR tipo_pessoa = 'FISICA');

ALTER TABLE agendamento
    ADD CONSTRAINT chk_agendamento_documento_identificacao_digitos
        CHECK (documento_identificacao ~ '^[0-9]+$');
