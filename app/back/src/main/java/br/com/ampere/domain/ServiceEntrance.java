package br.com.ampere.domain;

import java.math.BigDecimal;

/** The band of Tabela 1 or 2 the building falls in, and what it sizes. */
public record ServiceEntrance(
    String band,
    BigDecimal consideredKva,
    int circuits,
    BigDecimal cableSectionMm2,
    BigDecimal breakerAmps,
    NormativeReference reference) {}
