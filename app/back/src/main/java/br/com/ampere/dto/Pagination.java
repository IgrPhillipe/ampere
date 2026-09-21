package br.com.ampere.dto;

/** Metadados de paginacao das respostas de lista. */
public record Pagination(long total, int page, int pageSize) {}
