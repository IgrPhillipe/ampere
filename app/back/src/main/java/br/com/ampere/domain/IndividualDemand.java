package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.List;

/**
 * Demand of one apartment of a group, which sets its supply category (DIS-NOR-053 item 6.22.3).
 *
 * @param demandKva the installed load itself for a single-phase unit (DIS-NOR-030 item 6.28.1)
 * @param formula how the demand was reached, e.g. "a + b = 2,18 + 13,00 = 15,18 kVA"
 */
public record IndividualDemand(
    String groupName,
    int units,
    ConnectionType connectionType,
    BigDecimal installedKw,
    BigDecimal demandKva,
    String formula,
    List<String> lines,
    List<NormativeReference> references) {}
