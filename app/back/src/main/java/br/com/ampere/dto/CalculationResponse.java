package br.com.ampere.dto;

import br.com.ampere.domain.AppliedTable;
import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.CalculationCheck;
import br.com.ampere.domain.CalculationStep;
import br.com.ampere.domain.CheckStatus;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.IntStream;

/** The calculation memory of step 3 (prototype H4), as it was when the calculation ran. */
public record CalculationResponse(
    String id,
    String projectId,
    OffsetDateTime calculatedAt,
    Standards standards,
    List<Step> steps,
    Totals totals,
    Traceability traceability,
    List<Share> composition,
    List<Check> checks,
    int checksCount,
    int warningsCount,
    List<Table> appliedTables) {

  private static final int COMPONENTS = 4;
  private static final BigDecimal HUNDRED = new BigDecimal("100");

  public record Standards(StandardResponse main, StandardResponse secondary) {}

  public record Reference(
      String label,
      String identification,
      String standard,
      String revision,
      String item,
      String page) {}

  public record Step(
      int index,
      String code,
      String title,
      boolean applies,
      String formula,
      List<String> details,
      BigDecimal valueKva,
      Reference reference) {}

  public record Totals(
      BigDecimal calculatedKva,
      BigDecimal minimumKva,
      BigDecimal finalKva,
      boolean minimumApplied) {}

  public record Traceability(
      String voltage,
      String connectionType,
      String entranceStandard,
      BigDecimal currentAmps,
      String serviceEntranceBand,
      int circuits,
      BigDecimal cableSectionMm2,
      BigDecimal breakerAmps,
      String breakerPoles) {}

  public record Share(String code, BigDecimal valueKva, BigDecimal percent) {}

  public record Check(String code, CheckStatus status, String message) {}

  public record Table(
      String identification, String standard, String revision, String item, String page) {}

  public static CalculationResponse from(Calculation calculation) {
    List<CalculationStep> steps = calculation.getSteps();
    List<CalculationCheck> checks = calculation.getChecks();

    return new CalculationResponse(
        String.valueOf(calculation.getId()),
        String.valueOf(calculation.getProject().getId()),
        calculation.getCalculatedAt(),
        new Standards(
            standard(calculation.getMainStandard(), calculation.getMainStandardRevision()),
            standard(
                calculation.getSecondaryStandard(), calculation.getSecondaryStandardRevision())),
        IntStream.range(0, steps.size()).mapToObj(index -> step(index, steps.get(index))).toList(),
        new Totals(
            calculation.getCalculatedTotalDemand(),
            calculation.getMinimumTotalDemand(),
            calculation.getFinalTotalDemand(),
            calculation.isMinimumApplied()),
        new Traceability(
            calculation.getSupplyVoltage().label(),
            calculation.getConnectionType().label(),
            calculation.getEntranceStandard().label(),
            calculation.getCurrentAmps(),
            calculation.getServiceEntranceBand(),
            calculation.getServiceEntranceCircuits(),
            calculation.getCableSectionMm2(),
            calculation.getBreakerAmps(),
            calculation.getConnectionType().breakerPoles()),
        composition(steps.subList(0, Math.min(COMPONENTS, steps.size())), calculation),
        checks.stream()
            .map(check -> new Check(check.getCode(), check.getStatus(), check.getMessage()))
            .toList(),
        checks.size(),
        (int) checks.stream().filter(check -> check.getStatus() == CheckStatus.WARNING).count(),
        calculation.getAppliedTables().stream().map(CalculationResponse::table).toList());
  }

  private static StandardResponse standard(String name, String revision) {
    return name == null ? null : new StandardResponse(name, revision);
  }

  private static Step step(int index, CalculationStep step) {
    return new Step(
        index + 1,
        step.getCode(),
        step.getTitle(),
        step.applies(),
        step.getFormula(),
        step.getDetails(),
        step.getValueKva(),
        step.hasReference()
            ? new Reference(
                step.getReferenceLabel(),
                step.getReferenceIdentification(),
                step.getReferenceStandard(),
                step.getReferenceRevision(),
                step.getReferenceItem(),
                step.getReferencePage())
            : null);
  }

  /** Share of each component in the calculated demand, for the composition bar. */
  private static List<Share> composition(
      List<CalculationStep> components, Calculation calculation) {
    BigDecimal total = calculation.getCalculatedTotalDemand();

    return components.stream()
        .map(
            step ->
                new Share(
                    step.getCode(),
                    step.getValueKva(),
                    total.signum() == 0
                        ? BigDecimal.ZERO
                        : step.getValueKva()
                            .multiply(HUNDRED)
                            .divide(total, 1, RoundingMode.HALF_UP)))
        .toList();
  }

  private static Table table(AppliedTable table) {
    return new Table(
        table.getIdentification(),
        table.getStandard(),
        table.getRevision(),
        table.getItem(),
        table.getPage());
  }
}
