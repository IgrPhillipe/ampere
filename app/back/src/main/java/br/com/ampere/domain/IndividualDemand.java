package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.List;

/** Demand of one apartment of a group (DIS-NOR-053 item 6.22.3); kVA is null if single-phase. */
public record IndividualDemand(
    String groupName,
    BigDecimal installedKw,
    BigDecimal demandKva,
    List<String> lines,
    List<NormativeReference> references) {}
