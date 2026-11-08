package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.List;

/**
 * Demand of one apartment of a group, which sets its supply category (DIS-NOR-053 item 6.22.3).
 *
 * @param demandKva the installed load itself for a single-phase unit (DIS-NOR-030 item 6.28.1)
 */
public record IndividualDemand(
    String groupName,
    BigDecimal installedKw,
    BigDecimal demandKva,
    List<String> lines,
    List<NormativeReference> references) {}
