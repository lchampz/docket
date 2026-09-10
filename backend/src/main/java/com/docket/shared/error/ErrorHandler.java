package com.docket.shared.error;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.util.Comparator;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Single point for translating exceptions into HTTP responses (RFC 7807).
 *
 * <p>Every error body carries {@code codigo} — see {@link ErrorCode}. Validation
 * errors also carry {@code errors}, one item per field, so the UI can place the
 * message under the correct input instead of showing a generic toast.
 *
 * <p>Restricted to {@code @RestController} on purpose: without this, a
 * {@code ConflictException} thrown by the Thymeleaf UI would return JSON to the
 * browser. Server-rendered screens handle errors on their own, with an on-page
 * message.
 */
@RestControllerAdvice(annotations = RestController.class)
@Slf4j
public class ErrorHandler {

    private static final URI BASE = URI.create("https://docket.dev/erros/");

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail onBodyValidation(MethodArgumentNotValidException ex) {
        List<FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> new FieldError(e.getField(), e.getDefaultMessage()))
                .sorted(Comparator.comparing(FieldError::campo))
                .toList();

        // Constraint de classe (ex.: coerência tipoPessoa × documentoIdentificacao) não
        // tem campo próprio; o validator reporta o alvo via propertyNode.
        List<FieldError> globals = ex.getBindingResult().getGlobalErrors().stream()
                .map(e -> new FieldError(e.getObjectName(), e.getDefaultMessage()))
                .toList();

        return validation(java.util.stream.Stream.concat(errors.stream(), globals.stream()).toList());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail onParameterValidation(ConstraintViolationException ex) {
        List<FieldError> errors = ex.getConstraintViolations().stream()
                .map(v -> new FieldError(lastNode(v), v.getMessage()))
                .sorted(Comparator.comparing(FieldError::campo))
                .toList();
        return validation(errors);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail onNotFound(ResourceNotFoundException ex) {
        return problem(HttpStatus.NOT_FOUND, ErrorCode.NAO_ENCONTRADO,
                "Recurso não encontrado", ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    public ProblemDetail onConflict(ConflictException ex) {
        return problem(HttpStatus.CONFLICT, ex.getCode(), "Conflito", ex.getMessage());
    }

    /**
     * Safety net: database constraint that escaped the service check.
     * The service should block earlier and produce a better message — landing
     * here signals a race or missing rule, so it is logged at WARN.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail onIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("Database constraint reached without passing service rule", ex);
        return problem(HttpStatus.CONFLICT, ErrorCode.RECURSO_EM_USO, "Conflito",
                "A operação viola uma restrição de integridade dos dados.");
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail onUnexpectedFailure(Exception ex) {
        log.error("Unhandled failure", ex);
        // Generic message on purpose: internal exception detail is not client info.
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.ERRO_INTERNO,
                "Erro interno", "Ocorreu um erro inesperado ao processar a requisição.");
    }

    private ProblemDetail validation(List<FieldError> errors) {
        ProblemDetail p = problem(HttpStatus.BAD_REQUEST, ErrorCode.VALIDACAO,
                "Dados inválidos", "Um ou mais campos estão inválidos.");
        p.setProperty("errors", errors);
        return p;
    }

    private ProblemDetail problem(HttpStatus status, ErrorCode code, String title, String detail) {
        ProblemDetail p = ProblemDetail.forStatusAndDetail(status, detail);
        p.setTitle(title);
        p.setType(BASE.resolve(code.name().toLowerCase().replace('_', '-')));
        p.setProperty("codigo", code.name());
        return p;
    }

    private String lastNode(ConstraintViolation<?> v) {
        String path = v.getPropertyPath().toString();
        int dot = path.lastIndexOf('.');
        return dot >= 0 ? path.substring(dot + 1) : path;
    }
}
