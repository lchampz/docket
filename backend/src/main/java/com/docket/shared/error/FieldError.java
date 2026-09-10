package com.docket.shared.error;

/** A validation error tied to the field that caused it. */
public record FieldError(String campo, String mensagem) {}
