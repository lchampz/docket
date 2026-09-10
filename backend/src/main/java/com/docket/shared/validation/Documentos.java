package com.docket.shared.validation;

/**
 * Validação de dígitos verificadores de CPF e CNPJ.
 *
 * <p>Regex de formato aceita {@code 111.111.111-11}, que não existe. O check
 * de dígito é o que separa documento plausível de número aleatório, e é a
 * única defesa antes de virar registro.
 *
 * <p><strong>CNPJ é alfanumérico</strong> desde a IN RFB 2.229/2024: os 12
 * primeiros caracteres podem ser letras maiúsculas ou dígitos, e só os 2
 * dígitos verificadores permanecem numéricos. A aritmética é a mesma — o valor
 * de cada caractere é seu código ASCII menos 48, então {@code '0'..'9'} são
 * 0..9 e {@code 'A'..'Z'} são 17..42. CNPJ numérico legado continua válido:
 * o caso particular em que nenhuma letra aparece.
 */
public final class Documentos {

    private static final int[] CNPJ_WEIGHTS = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

    private Documentos() {}

    /**
     * Remove máscara sem perder informação: tira tudo que não é letra ou dígito
     * e coloca em maiúsculas.
     *
     * <p>Não use {@code replaceAll("\\D", "")} no campo de identificação —
     * isso apagaria letras alfanuméricas do CNPJ e transformaria documento
     * válido em lixo silenciosamente.
     */
    public static String normalize(String value) {
        return value == null ? null : value.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
    }

    /** Remove tudo que não é dígito. Para CEP etc. — nunca para CNPJ. */
    public static String onlyDigits(String value) {
        return value == null ? null : value.replaceAll("\\D", "");
    }

    public static boolean isCpfValid(String value) {
        if (value == null || !value.matches("\\d{11}") || allSame(value)) {
            return false;
        }
        return mod11Digit(value, 9, 10) == charValue(value, 9)
                && mod11Digit(value, 10, 11) == charValue(value, 10);
    }

    public static boolean isCnpjValid(String value) {
        // 12 alfanuméricos + 2 dígitos verificadores numéricos.
        if (value == null || !value.matches("[A-Z0-9]{12}\\d{2}") || allSame(value)) {
            return false;
        }
        return cnpjDigit(value, 12) == charValue(value, 12)
                && cnpjDigit(value, 13) == charValue(value, 13);
    }

    /**
     * Sequência repetida passa na aritmética mod-11 — 111.111.111-11 fecha e
     * não é CPF. Daí este check vir primeiro.
     */
    private static boolean allSame(String value) {
        return value.chars().distinct().count() == 1;
    }

    private static int mod11Digit(String value, int length, int initialWeight) {
        int sum = 0;
        for (int i = 0; i < length; i++) {
            sum += charValue(value, i) * (initialWeight - i);
        }
        int remainder = 11 - (sum % 11);
        return remainder >= 10 ? 0 : remainder;
    }

    private static int cnpjDigit(String value, int length) {
        int offset = CNPJ_WEIGHTS.length - length;
        int sum = 0;
        for (int i = 0; i < length; i++) {
            sum += charValue(value, i) * CNPJ_WEIGHTS[offset + i];
        }
        int remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }

    /** Valor posicional: ASCII menos 48, conforme regra do CNPJ alfanumérico. */
    private static int charValue(String value, int index) {
        return value.charAt(index) - '0';
    }
}
