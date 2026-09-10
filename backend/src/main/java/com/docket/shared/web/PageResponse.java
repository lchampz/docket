package com.docket.shared.web;

import java.util.List;
import org.springframework.data.domain.Page;

/**
 * Custom pagination envelope.
 *
 * <p>Serializing Spring's {@code Page} directly in the body exposes the framework's
 * internal structure in the public contract and changes shape between versions.
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last) {

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }
}
