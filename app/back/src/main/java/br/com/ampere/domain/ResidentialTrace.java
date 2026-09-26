package br.com.ampere.domain;

import java.math.BigDecimal;

/** The residential figures the calculation record keeps (DIS-NOR-053 Anexo I, items 2 to 6). */
public record ResidentialTrace(
    int apartments,
    BigDecimal demand,
    BigDecimal coincidenceFactor,
    BigDecimal residentialDemand,
    BigDecimal safetyFactor,
    String safetyFactorBand) {}
