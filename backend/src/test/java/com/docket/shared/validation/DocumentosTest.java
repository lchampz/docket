package com.docket.shared.validation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

class DocumentosTest {

    @ParameterizedTest
    @ValueSource(strings = {"11144477735", "52998224725"})
    @DisplayName("CPF válido")
    void cpfValido(String cpf) {
        assertThat(Documentos.isCpfValid(cpf)).isTrue();
    }

    @Test
    @DisplayName("CPF com dígito verificador errado")
    void cpfDigitoErrado() {
        assertThat(Documentos.isCpfValid("11144477734")).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {"11111111111", "00000000000"})
    @DisplayName("CPF com todos os dígitos iguais")
    void cpfRepetido(String cpf) {
        assertThat(Documentos.isCpfValid(cpf)).isFalse();
    }

    @Test
    @DisplayName("CPF curto")
    void cpfCurto() {
        assertThat(Documentos.isCpfValid("1114447773")).isFalse();
    }

    @ParameterizedTest
    @NullAndEmptySource
    @DisplayName("CPF nulo ou vazio")
    void cpfNulo(String cpf) {
        assertThat(Documentos.isCpfValid(cpf)).isFalse();
    }

    @Test
    @DisplayName("CNPJ no lugar de CPF")
    void cnpjNoLugarDeCpf() {
        assertThat(Documentos.isCpfValid("12ABC34501DE35")).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {"11222333000181", "11444777000161", "12ABC34501DE35"})
    @DisplayName("CNPJ válido (numérico e alfanumérico)")
    void cnpjValido(String cnpj) {
        assertThat(Documentos.isCnpjValid(cnpj)).isTrue();
    }

    @Test
    @DisplayName("CNPJ alfanumérico com dígito verificador errado")
    void cnpjDigitoErrado() {
        assertThat(Documentos.isCnpjValid("12ABC34501DE34")).isFalse();
    }

    @Test
    @DisplayName("CNPJ alfanumérico minúsculo cru é rejeitado")
    void cnpjMinusculoCruRejeitado() {
        assertThat(Documentos.isCnpjValid("12abc34501de35")).isFalse();
    }

    @Test
    @DisplayName("CNPJ com letra no dígito verificador é rejeitado")
    void cnpjLetraNoDigitoVerificador() {
        assertThat(Documentos.isCnpjValid("12ABC34501DEA5")).isFalse();
    }

    @Test
    @DisplayName("CNPJ com todos os caracteres iguais")
    void cnpjRepetido() {
        assertThat(Documentos.isCnpjValid("11111111111111")).isFalse();
    }

    @Test
    @DisplayName("normalize remove máscara e coloca em maiúsculas")
    void normalize() {
        assertThat(Documentos.normalize("12.abc.345/01de-35")).isEqualTo("12ABC34501DE35");
        assertThat(Documentos.normalize("111.444.777-35")).isEqualTo("11144477735");
    }

    @Test
    @DisplayName("onlyDigits não serve para CNPJ alfanumérico")
    void onlyDigitsNaoServeParaCnpj() {
        assertThat(Documentos.onlyDigits("12ABC34501DE35")).isEqualTo("123450135");
    }
}
