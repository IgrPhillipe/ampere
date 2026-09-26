package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Ded = Drf + Ds + Dc + Dve (DIS-NOR-053 Anexo I). Every group computes its own share through
 * {@link ConsumerUnitGroup#demand}; the engine never asks which kind a group is.
 */
public final class DemandEngine {

  private static final BigDecimal SIMPLIFIED_PROJECT_KVA = new BigDecimal("50");
  private static final BigDecimal NETWORK_STUDY_KW = new BigDecimal("20");

  private DemandEngine() {}

  public static DemandResult run(List<ConsumerUnitGroup> groups, DemandContext context) {
    List<DemandContribution> contributions =
        groups.stream().map(group -> group.demand(context)).toList();

    List<DemandStep> steps = new ArrayList<>();
    Arrays.stream(DemandComponent.values())
        .forEach(
            component ->
                steps.add(
                    component.combine(
                        contributions.stream()
                            .filter(contribution -> contribution.component() == component)
                            .toList(),
                        context)));

    BigDecimal calculated =
        steps.stream().map(DemandStep::valueKva).reduce(BigDecimal.ZERO, BigDecimal::add);
    ServiceEntrance entrance = serviceEntrance(calculated, context).orElse(null);
    BigDecimal considered =
        entrance == null ? calculated : calculated.max(entrance.consideredKva());
    boolean minimumApplied = considered.compareTo(calculated) > 0;
    steps.add(totalStep(steps, calculated, considered, entrance, context));

    List<NormativeReference> applied = new ArrayList<>();
    steps.forEach(step -> applied.addAll(step.references()));

    return new DemandResult(
        List.copyOf(steps),
        calculated,
        entrance == null ? null : entrance.consideredKva(),
        considered,
        minimumApplied,
        entrance,
        context.connectionType().currentAmps(calculated, context.voltage()),
        checks(steps, contributions, calculated, considered, minimumApplied, entrance, context),
        DemandComponent.distinct(applied));
  }

  /** Tabela 1 or 2: the ceiling of the band is the demand the standard considers (item 8). */
  private static Optional<ServiceEntrance> serviceEntrance(
      BigDecimal calculated, DemandContext context) {
    return context
        .tables()
        .lookup(context.voltage().serviceEntranceTable(), null, calculated)
        .map(
            band ->
                new ServiceEntrance(
                    band.band(),
                    DeclaredValues.kva(band.row().getUpperBound()),
                    band.value().intValue(),
                    band.secondValue(),
                    band.thirdValue(),
                    band.reference()));
  }

  private static DemandStep totalStep(
      List<DemandStep> components,
      BigDecimal calculated,
      BigDecimal considered,
      ServiceEntrance entrance,
      DemandContext context) {
    String symbols = String.join(" + ", components.stream().map(DemandStep::code).toList());
    String values =
        String.join(
            " + ",
            components.stream().map(step -> DeclaredValues.fixed(step.valueKva(), 2)).toList());

    NormativeReference table =
        entrance == null
            ? context
                .tables()
                .find(context.voltage().serviceEntranceTable(), null, null)
                .reference()
            : entrance.reference();
    List<String> details = new ArrayList<>();
    if (entrance == null) {
      details.add(
          "Acima da última faixa da "
              + table.identification()
              + " ("
              + context.voltage().label()
              + "): a entrada de serviço é dimensionada com a distribuidora");
    } else {
      details.add(
          "Faixa "
              + entrance.band()
              + " kVA da "
              + table.identification()
              + " ("
              + context.voltage().label()
              + "): considera-se "
              + DeclaredValues.fixed(considered, 2)
              + " kVA");
      details.add(
          "Entrada de serviço: "
              + entrance.circuits()
              + (entrance.circuits() == 1 ? " circuito de " : " circuitos de ")
              + DeclaredValues.decimal(entrance.cableSectionMm2())
              + " mm² e disjuntor geral de "
              + DeclaredValues.decimal(entrance.breakerAmps())
              + " A");
    }

    return new DemandStep(
        "Ded",
        "Demanda total da edificação",
        true,
        symbols + " = " + values + " = " + DeclaredValues.fixed(calculated, 2) + " kVA",
        details,
        considered,
        table,
        List.of(table),
        null);
  }

  private static List<CalculationCheck> checks(
      List<DemandStep> steps,
      List<DemandContribution> contributions,
      BigDecimal calculated,
      BigDecimal considered,
      boolean minimumApplied,
      ServiceEntrance entrance,
      DemandContext context) {
    List<CalculationCheck> checks = new ArrayList<>();

    checks.add(serviceEntranceCheck(calculated, considered, minimumApplied, entrance, context));

    BigDecimal chargingKw =
        contributions.stream()
            .filter(contribution -> contribution.component() == DemandComponent.EV_CHARGING)
            .map(DemandContribution::subtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    boolean charging = chargingKw.signum() > 0;
    checks.add(
        new CalculationCheck(
            "TRANSFORMER_LIMIT",
            CheckStatus.SKIPPED,
            charging
                ? "Limite de 50 % da potência do transformador para serviço e recarga"
                    + " (DIS-NOR-053, item 6.26.2) não verificado: o projeto não informa o"
                    + " transformador."
                : "Sem recarga de veículos: o limite do transformador (DIS-NOR-053, item"
                    + " 6.26.2) não se aplica."));
    checks.add(
        new CalculationCheck(
            "NETWORK_STUDY",
            !charging
                ? CheckStatus.SKIPPED
                : chargingKw.compareTo(NETWORK_STUDY_KW) > 0
                    ? CheckStatus.WARNING
                    : CheckStatus.PASSED,
            !charging
                ? "Sem recarga de veículos: o estudo de rede (DIS-NOR-030, item 6.26.4.2) não se"
                    + " aplica."
                : "Recarga de "
                    + DeclaredValues.fixed(chargingKw, 2)
                    + " kW instalados"
                    + (chargingKw.compareTo(NETWORK_STUDY_KW) > 0
                        ? ", acima de 20 kW: exige estudo da rede de distribuição"
                        : ", até 20 kW: dispensa estudo da rede de distribuição")
                    + " (DIS-NOR-030, item 6.26.4.2)."));

    checks.add(
        new CalculationCheck(
            "PROJECT_SIZE",
            CheckStatus.INFO,
            considered.compareTo(SIMPLIFIED_PROJECT_KVA) <= 0
                ? "Até 50 kVA: admite projeto simplificado (DIS-NOR-053, item 6.27.1)."
                : "Acima de 50 kVA: exige projeto completo analisado pela distribuidora"
                    + " (DIS-NOR-053, item 6.27.3)."));

    ResidentialTrace residential =
        steps.get(DemandComponent.RESIDENTIAL_UNITS.ordinal()).residential();
    checks.add(
        residential == null
            ? new CalculationCheck(
                "SAFETY_FACTOR",
                CheckStatus.SKIPPED,
                "Sem unidades residenciais: o fator de segurança não se aplica.")
            : new CalculationCheck(
                "SAFETY_FACTOR",
                CheckStatus.PASSED,
                "Fr de "
                    + DeclaredValues.decimal(residential.safetyFactor())
                    + ", valor recomendado do Quadro 37 para "
                    + residential.safetyFactorBand()
                    + " (DIS-NOR-053 Anexo I, item 5)."));

    return checks;
  }

  /** Tabelas 1 and 2 size a three-phase entrance up to 300 kVA; outside that, a warning. */
  private static CalculationCheck serviceEntranceCheck(
      BigDecimal calculated,
      BigDecimal considered,
      boolean minimumApplied,
      ServiceEntrance entrance,
      DemandContext context) {
    String table = context.voltage().serviceEntranceTable().identification();
    if (entrance == null) {
      return new CalculationCheck(
          "MINIMUM_BY_VOLTAGE",
          CheckStatus.WARNING,
          "Demanda calculada de "
              + DeclaredValues.fixed(calculated, 2)
              + " kVA acima da última faixa da "
              + table
              + ": a entrada de serviço precisa ser dimensionada com a distribuidora"
              + " (DIS-NOR-053 Anexo I, item 8).");
    }
    if (context.connectionType() != ConnectionType.THREE_PHASE) {
      return new CalculationCheck(
          "MINIMUM_BY_VOLTAGE",
          CheckStatus.WARNING,
          "A "
              + table
              + " dimensiona a entrada trifásica de edificação coletiva. Com ligação "
              + context.connectionType().label().toLowerCase()
              + ", confira a entrada pela DIS-NOR-030, item 6.28.");
    }
    return new CalculationCheck(
        "MINIMUM_BY_VOLTAGE",
        minimumApplied ? CheckStatus.INFO : CheckStatus.PASSED,
        "Demanda calculada de "
            + DeclaredValues.fixed(calculated, 2)
            + " kVA na faixa "
            + entrance.band()
            + " da "
            + table
            + ": o dimensionamento considera "
            + DeclaredValues.fixed(considered, 2)
            + " kVA (DIS-NOR-053 Anexo I, item 8).");
  }
}
