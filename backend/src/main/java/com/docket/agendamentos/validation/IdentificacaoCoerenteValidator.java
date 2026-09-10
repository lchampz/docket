package com.docket.agendamentos.validation;

import com.docket.agendamentos.TipoPessoa;
import com.docket.shared.validation.Documentos;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class IdentificacaoCoerenteValidator
        implements ConstraintValidator<IdentificacaoCoerente, PossuiIdentificacao> {

    @Override
    public boolean isValid(PossuiIdentificacao target, ConstraintValidatorContext context) {
        if (target == null) {
            return true;
        }
        TipoPessoa type = target.tipoPessoa();
        String digits = Documentos.normalize(target.documentoIdentificacao());

        // Campos ausentes são tratados pelo @NotNull de cada um. Reclamar duas
        // vezes do mesmo buraco só polui a lista de erros na tela.
        if (type == null || digits == null || digits.isEmpty()) {
            return true;
        }

        boolean valid = switch (type) {
            case FISICA -> Documentos.isCpfValid(digits);
            case JURIDICA -> Documentos.isCnpjValid(digits);
        };

        if (!valid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                            type == TipoPessoa.FISICA
                                    ? "CPF inválido"
                                    : "CNPJ inválido")
                    // Amarra o erro ao campo documentoIdentificacao: é onde a
                    // tela precisa pintar a mensagem, não no formulário inteiro.
                    .addPropertyNode("documentoIdentificacao")
                    .addConstraintViolation();
        }
        return valid;
    }
}
