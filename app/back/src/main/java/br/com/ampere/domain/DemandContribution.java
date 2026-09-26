package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.List;

/**
 * What one group adds to its component, before the factors that belong to the whole building.
 *
 * @param subtotal kVA, except for charging points, which contribute installed kW
 * @param term how the subtotal enters the component formula, e.g. "24 × 1,57"
 * @param formula the group's own formula, shown when it is the only one of its component
 */
public record DemandContribution(
    DemandComponent component,
    String groupName,
    int units,
    boolean compact,
    BigDecimal subtotal,
    String term,
    String formula,
    List<String> lines,
    List<NormativeReference> references) {}
