package com.docket.cartorios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Set;

/**
 * Cada constraint traz sua própria {@code message}.
 *
 * <p>A mensagem padrão do Bean Validation para {@code @Pattern} imprime a
 * expressão regular — "must match ^\\d{8}$" — e essa string chega na tela do
 * usuário, tanto no Thymeleaf quanto no React.
 *
 * <p>Patterns aceitam vazio de propósito: {@code @NotBlank} cuida do campo em
 * branco. Sem isso, um campo vazio dispara os dois e a tela mostra duas
 * mensagens para o mesmo buraco.
 */
public record CartorioRequest(
        @NotBlank(message = "Informe o nome do cartório")
        @Size(max = 150, message = "Máximo de 150 caracteres")
        String nome,

        @NotBlank(message = "Informe o CEP")
        @Pattern(regexp = "^(\\d{8})?$", message = "CEP deve ter 8 dígitos")
        String cep,

        @NotBlank(message = "Informe a rua")
        @Size(max = 150, message = "Máximo de 150 caracteres")
        String rua,

        @NotBlank(message = "Informe o número")
        @Size(max = 20, message = "Máximo de 20 caracteres")
        String numero,

        @Size(max = 100, message = "Máximo de 100 caracteres")
        String complemento,

        @Size(max = 100, message = "Máximo de 100 caracteres")
        String bairro,

        @NotBlank(message = "Informe a cidade")
        @Size(max = 100, message = "Máximo de 150 caracteres")
        String cidade,

        @NotBlank(message = "Selecione a UF")
        @Pattern(regexp = "^([A-Z]{2})?$", message = "UF deve ter duas letras maiúsculas")
        String uf,

        // "Um cartório emite uma ou mais certidões" — zero não é permitido:
        // cartório sem documentos não serve em nenhum agendamento.
        @NotEmpty(message = "Selecione ao menos um documento emitido")
        Set<Long> documentoIds) {}
