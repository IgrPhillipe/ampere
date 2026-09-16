package br.com.ampere.dto;

/**
 * Metadados de paginacao das respostas de lista.
 *
 * <p>Espelha o tipo {@code Pagination} do front-end em {@code
 * app/front/src/features/shared/types/index.ts}. Os nomes dos campos precisam bater exatamente.
 */
public record Pagination(long total, int page, int pageSize) {}
