package com.docket.agendamentos.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import static java.lang.annotation.ElementType.ANNOTATION_TYPE;
import static java.lang.annotation.ElementType.TYPE;

/**
 * Constraint de classe: a identificação deve ser válida <em>e</em> coerente com
 * o tipo de pessoa.
 *
 * <p>É de classe, não de campo, porque a regra depende de dois campos ao mesmo
 * tempo — um validador de campo não enxerga o irmão. Aplique em um DTO que
 * implemente {@link PossuiIdentificacao}.
 */
@Documented
@Constraint(validatedBy = IdentificacaoCoerenteValidator.class)
@Target({TYPE, ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface IdentificacaoCoerente {

    String message() default "Documento inválido para o tipo de pessoa informado";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
