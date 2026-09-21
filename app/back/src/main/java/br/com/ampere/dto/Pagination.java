package br.com.ampere.dto;

/** Pagination metadata of list responses. */
public record Pagination(long total, int page, int pageSize) {}
