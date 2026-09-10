package com.docket.shared.error;

/**
 * Código de erro estável exposto no corpo do ProblemDetail.
 *
 * <p>O front decide como tratar o erro a partir daqui — não pela mensagem,
 * que muda, nem pelo status HTTP, que é grosso demais (dois 409 diferentes
 * precisam de tratamento diferente na tela).
 */
public enum ErrorCode {
    VALIDACAO,
    NAO_ENCONTRADO,
    PAR_CARTORIO_DOCUMENTO_INVALIDO,
    NOME_DUPLICADO,
    RECURSO_EM_USO,
    ERRO_INTERNO
}
