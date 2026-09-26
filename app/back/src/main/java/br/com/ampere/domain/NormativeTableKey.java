package br.com.ampere.domain;

/** One row key a keyed table accepts, e.g. the largest motor of Tabela 14. */
public record NormativeTableKey(String code, String label) {}
