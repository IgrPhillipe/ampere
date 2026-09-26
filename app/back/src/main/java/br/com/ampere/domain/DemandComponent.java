package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

/**
 * A share of the total demand, in the notation of DIS-NOR-053 Anexo I. Each share combines what its
 * groups contributed and applies the factors that belong to the whole building.
 */
public enum DemandComponent {
  RESIDENTIAL_UNITS("Drf", "Demanda das unidades residenciais") {
    /** Fc comes from every apartment of the building, not group by group (Anexo I, item 3). */
    @Override
    DemandStep combineApplicable(List<DemandContribution> contributions, DemandContext context) {
      BigDecimal demand = sum(contributions);
      int apartments = contributions.stream().mapToInt(DemandContribution::units).sum();
      boolean compact =
          apartments > COMPACT_THRESHOLD
              && contributions.stream().allMatch(DemandContribution::compact);

      List<String> details = new ArrayList<>(lines(contributions));
      List<NormativeReference> references = new ArrayList<>(references(contributions));
      BigDecimal coincidence;
      if (compact) {
        coincidence = COMPACT_COINCIDENCE;
        details.add(
            "Fc fixo de 90 % para smart, studio e similares acima de 15 unidades (DIS-NOR-053"
                + " Anexo I, item 4)");
      } else {
        NormativeValue quadro36 =
            context.tables().find(NormativeTableCode.Q36_COINCIDENCE_FACTOR, count(apartments));
        coincidence = quadro36.factor();
        references.add(quadro36.reference());
        details.add(
            "Fc para "
                + apartments
                + " apartamentos: "
                + DeclaredValues.fixed(quadro36.value(), 2)
                + " % ("
                + quadro36.reference().identification()
                + ")");
      }

      BigDecimal residential = DeclaredValues.kva(demand.multiply(coincidence));
      NormativeValue quadro37 =
          context.tables().find(NormativeTableCode.Q37_SAFETY_FACTOR, residential);
      BigDecimal safety = quadro37.value();
      references.add(quadro37.reference());
      details.add(
          "Dr = "
              + DeclaredValues.fixed(demand, 2)
              + " × "
              + DeclaredValues.fixed(coincidence, 4)
              + " = "
              + DeclaredValues.fixed(residential, 2)
              + " kVA");
      details.add(
          "Fr = "
              + DeclaredValues.decimal(safety)
              + " ("
              + quadro37.reference().identification()
              + ", "
              + quadro37.band()
              + ")");

      return new DemandStep(
          symbol(),
          title(),
          true,
          "("
              + String.join(" + ", terms(contributions))
              + ") × "
              + DeclaredValues.fixed(coincidence, 4)
              + " × "
              + DeclaredValues.decimal(safety),
          details,
          DeclaredValues.kva(residential.multiply(safety)),
          references.get(0),
          distinct(references),
          new ResidentialTrace(
              apartments, demand, coincidence, residential, safety, quadro37.band()));
    }
  },
  CONDOMINIUM_SERVICES("Ds", "Demanda das áreas comuns") {
    @Override
    DemandStep combineApplicable(List<DemandContribution> contributions, DemandContext context) {
      return installedLoad(contributions);
    }
  },
  NON_RESIDENTIAL_UNITS("Dc", "Demanda das cargas comerciais") {
    @Override
    DemandStep combineApplicable(List<DemandContribution> contributions, DemandContext context) {
      return installedLoad(contributions);
    }
  },
  EV_CHARGING("Dve", "Demanda da recarga de veículos elétricos") {
    /** The factor of Quadro 33 goes on every point of the building (Anexo I, item 13). */
    @Override
    DemandStep combineApplicable(List<DemandContribution> contributions, DemandContext context) {
      int points = contributions.stream().mapToInt(DemandContribution::units).sum();
      NormativeValue quadro33 =
          context.tables().find(NormativeTableCode.Q33_EV_STATIONS, count(points));
      BigDecimal installed = sum(contributions);

      List<String> details = new ArrayList<>(lines(contributions));
      details.add(
          "Fator para "
              + points
              + (points == 1 ? " estação: " : " estações: ")
              + DeclaredValues.fixed(quadro33.value(), 2)
              + " ("
              + quadro33.reference().identification()
              + ")");
      List<NormativeReference> references = new ArrayList<>(references(contributions));
      references.add(0, quadro33.reference());

      return new DemandStep(
          symbol(),
          title(),
          true,
          "("
              + String.join(" + ", terms(contributions))
              + ") kW × "
              + DeclaredValues.fixed(quadro33.value(), 2),
          details,
          DeclaredValues.kva(installed.multiply(quadro33.value())),
          quadro33.reference(),
          distinct(references),
          null);
    }
  };

  private static final int COMPACT_THRESHOLD = 15;
  private static final BigDecimal COMPACT_COINCIDENCE = new BigDecimal("0.9000");

  private final String symbol;
  private final String title;

  DemandComponent(String symbol, String title) {
    this.symbol = symbol;
    this.title = title;
  }

  public String symbol() {
    return symbol;
  }

  public String title() {
    return title;
  }

  public DemandStep combine(List<DemandContribution> contributions, DemandContext context) {
    return contributions.isEmpty()
        ? DemandStep.notApplicable(this)
        : combineApplicable(contributions, context);
  }

  abstract DemandStep combineApplicable(
      List<DemandContribution> contributions, DemandContext context);

  /** Ds and Dc: the installed load method of DIS-NOR-030 item 6.27, summed over the groups. */
  DemandStep installedLoad(List<DemandContribution> contributions) {
    boolean single = contributions.size() == 1;
    List<String> details = new ArrayList<>();
    if (!single) {
      contributions.forEach(
          contribution -> details.add(contribution.groupName() + ": " + contribution.formula()));
    }
    details.addAll(lines(contributions));
    List<NormativeReference> references = distinct(references(contributions));

    return new DemandStep(
        symbol,
        title,
        true,
        single ? contributions.get(0).formula() : String.join(" + ", terms(contributions)),
        details,
        DeclaredValues.kva(sum(contributions)),
        references.isEmpty() ? null : references.get(0),
        references,
        null);
  }

  private static BigDecimal sum(List<DemandContribution> contributions) {
    return contributions.stream()
        .map(DemandContribution::subtotal)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private static BigDecimal count(int units) {
    return BigDecimal.valueOf(units);
  }

  private static List<String> terms(List<DemandContribution> contributions) {
    return contributions.stream().map(DemandContribution::term).toList();
  }

  private static List<String> lines(List<DemandContribution> contributions) {
    return contributions.stream().flatMap(contribution -> contribution.lines().stream()).toList();
  }

  private static List<NormativeReference> references(List<DemandContribution> contributions) {
    return contributions.stream()
        .flatMap(contribution -> contribution.references().stream())
        .toList();
  }

  static List<NormativeReference> distinct(List<NormativeReference> references) {
    return List.copyOf(new LinkedHashSet<>(references));
  }
}
