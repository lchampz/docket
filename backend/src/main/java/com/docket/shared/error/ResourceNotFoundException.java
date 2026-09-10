package com.docket.shared.error;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, Object id) {
        super("%s %s não encontrado".formatted(resource, id));
    }
}
