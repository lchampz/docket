-- CNPJ passou a ser alfanumérico (IN RFB 2.229/2024): os 12 primeiros caracteres
-- podem ser letra maiúscula ou dígito, e só os 2 dígitos verificadores seguem
-- numéricos. CNPJ antigo, todo numérico, continua aceito — é o caso particular
-- sem letras.
--
-- As duas constraints anteriores viravam as costas para isso: uma exigia só
-- dígitos, a outra media comprimento sem olhar o alfabeto. Substituídas por uma
-- só, que expressa formato e comprimento juntos.

ALTER TABLE agendamento
    DROP CONSTRAINT chk_agendamento_documento_identificacao;

ALTER TABLE agendamento
    DROP CONSTRAINT chk_agendamento_documento_identificacao_digitos;

ALTER TABLE agendamento
    ADD CONSTRAINT chk_agendamento_documento_identificacao
        CHECK (
            (tipo_pessoa = 'FISICA'   AND documento_identificacao ~ '^[0-9]{11}$')
            OR (tipo_pessoa = 'JURIDICA' AND documento_identificacao ~ '^[A-Z0-9]{12}[0-9]{2}$')
        );
