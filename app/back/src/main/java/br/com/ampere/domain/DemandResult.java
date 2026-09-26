package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.List;

/**
 * The whole calculation: the five steps, the demand considered and what it sizes.
 *
 * @param steps Drf, Ds, Dc, Dve and Ded, always in this order
 */
public record DemandResult(
    List<DemandStep> steps,
    BigDecimal calculatedKva,
    BigDecimal minimumKva,
    BigDecimal finalKva,
    boolean minimumApplied,
    ServiceEntrance serviceEntrance,
    BigDecimal currentAmps,
    List<CalculationCheck> checks,
    List<NormativeReference> appliedTables) {

  public BigDecimal valueOf(DemandComponent component) {
    return steps.get(component.ordinal()).valueKva();
  }

  public ResidentialTrace residential() {
    return steps.get(DemandComponent.RESIDENTIAL_UNITS.ordinal()).residential();
  }
}
