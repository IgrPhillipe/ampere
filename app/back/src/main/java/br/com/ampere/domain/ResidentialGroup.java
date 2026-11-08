package br.com.ampere.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;

/** Apartments of the same useful area (DIS-NOR-053 Anexo I, Quadro 35). */
@Entity
@DiscriminatorValue("RESIDENTIAL")
public class ResidentialGroup extends ConsumerUnitGroup {

  /** Last row of Quadro 35. */
  private static final BigDecimal LARGEST_TABULATED_AREA = new BigDecimal("1000");

  /** DIS-NOR-030 item 6.2.1: secondary voltage up to 75 kW of installed load. */
  static final BigDecimal LOW_VOLTAGE_LIMIT_KW = new BigDecimal("75");

  /** Ceiling of category M3, the largest single-phase one (DIS-NOR-030 Anexo I, Tabela 2). */
  static final BigDecimal SINGLE_PHASE_LIMIT_KW = new BigDecimal("15");

  private BigDecimal usefulArea;

  private Integer bedrooms;

  private BigDecimal unitLoadKw;

  // Nullable: SINGLE_TABLE shares the row with the other kinds.
  private Boolean compactUnit;

  // Each apartment has its own connection; the building's one only sizes the entrance.
  @Enumerated(EnumType.STRING)
  private ConnectionType connectionType;

  /** Three-phase only (DIS-NOR-030 item 6.27); a single-phase unit declares its total load. */
  // Eager: the controller maps the response after the transaction, with open-in-view off.
  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "residential_group_load", joinColumns = @JoinColumn(name = "group_id"))
  @OrderColumn(name = "position")
  private List<LoadItem> loads = new ArrayList<>();

  protected ResidentialGroup() {}

  public ResidentialGroup(Project project, GroupSpec spec) {
    super(project);
    update(spec);
  }

  @Override
  protected void applySpec(GroupSpec spec) {
    this.usefulArea = spec.usefulArea();
    this.bedrooms = spec.bedrooms();
    this.compactUnit = Boolean.TRUE.equals(spec.compactUnit());
    this.connectionType = spec.connectionType();
    this.loads.clear();
    if (isThreePhase()) {
      // Not stored: the column keeps two decimals and the sum of CV loads has more.
      this.unitLoadKw = null;
      if (spec.items() != null) {
        this.loads.addAll(spec.items());
      }
    } else {
      this.unitLoadKw = spec.unitLoadKw();
    }
  }

  /** What the request cannot carry at all, as opposed to data still missing. */
  static Optional<String> rejection(GroupSpec spec) {
    if (spec.connectionType() == ConnectionType.TWO_PHASE) {
      return Optional.of("A ligação do apartamento é monofásica ou trifásica.");
    }
    if (spec.connectionType() == ConnectionType.THREE_PHASE
        && (spec.items() == null || spec.items().isEmpty())) {
      return Optional.of("Detalhe as cargas do apartamento trifásico.");
    }
    return Optional.empty();
  }

  @Override
  public GroupSpec spec() {
    return new GroupSpec(
        getName(),
        getQuantity(),
        usefulArea,
        bedrooms,
        getUnitLoadKw(),
        compactUnit,
        connectionType,
        null,
        isThreePhase() ? loads : null,
        null,
        null,
        null,
        null);
  }

  public BigDecimal getUsefulArea() {
    return usefulArea;
  }

  public Integer getBedrooms() {
    return bedrooms;
  }

  /** Declared for a single-phase unit; the sum of the loads for a three-phase one. */
  public BigDecimal getUnitLoadKw() {
    if (isThreePhase()) {
      return loads.stream().map(LoadItem::declaredLoadKw).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    return unitLoadKw;
  }

  public ConnectionType getConnectionType() {
    return connectionType;
  }

  /** Empty unless the apartment is three-phase. */
  public List<LoadItem> getLoads() {
    return List.copyOf(loads);
  }

  private boolean isThreePhase() {
    return connectionType == ConnectionType.THREE_PHASE;
  }

  /** Smart, studio or home studio (item 6.25.1). */
  public boolean isCompactUnit() {
    return Boolean.TRUE.equals(compactUnit);
  }

  @Override
  public GroupKind kind() {
    return GroupKind.RESIDENTIAL;
  }

  @Override
  public List<ValidationIssue> validate() {
    BigDecimal load = getUnitLoadKw();
    List<ValidationIssue> issues = new ArrayList<>();
    if (connectionType == null) {
      issues.add(
          ValidationIssue.missing(
              "connectionType", "Informe a ligação do apartamento: monofásica ou trifásica."));
    }
    if (!DeclaredValues.isPositive(usefulArea)) {
      issues.add(
          ValidationIssue.missing(
              "usefulArea", "Informe a área útil. Ela define a demanda de cada unidade."));
    } else if (usefulArea.compareTo(LARGEST_TABULATED_AREA) > 0) {
      issues.add(
          ValidationIssue.review(
              "usefulArea",
              "Área útil de "
                  + DeclaredValues.decimal(usefulArea)
                  + " m² passa da última faixa do Quadro 35 (1.000 m²): confirme o valor."));
    }
    if (isThreePhase()) {
      IntStream.range(0, loads.size())
          .forEach(
              index ->
                  issues.addAll(
                      loads.get(index).validate("loads[" + index + "]", LoadUsage.APARTMENT)));
    } else if (!DeclaredValues.isPositive(load)) {
      issues.add(
          ValidationIssue.missing(
              "unitLoadKw",
              "Informe a carga instalada por unidade, usada no cálculo individual do item"
                  + " 6.22.3."));
    }
    if (DeclaredValues.isPositive(load) && load.compareTo(LOW_VOLTAGE_LIMIT_KW) > 0) {
      issues.add(
          ValidationIssue.review(
              isThreePhase() ? "loads" : "unitLoadKw",
              "Carga instalada de "
                  + DeclaredValues.decimal(load)
                  + " kW por unidade passa do limite de 75 kW da baixa tensão (DIS-NOR-030, item"
                  + " 6.2.1)."));
    } else if (connectionType == ConnectionType.SINGLE_PHASE
        && DeclaredValues.isPositive(load)
        && load.compareTo(SINGLE_PHASE_LIMIT_KW) > 0) {
      issues.add(
          ValidationIssue.review(
              "unitLoadKw",
              "Carga instalada de "
                  + DeclaredValues.decimal(load)
                  + " kW passa de 15 kW, teto da ligação monofásica (DIS-NOR-030, Anexo I, Tabela"
                  + " 2, categoria M3): confirme a ligação do apartamento."));
    }
    return issues;
  }

  @Override
  public BigDecimal loadPerUnitKw() {
    BigDecimal load = getUnitLoadKw();
    return DeclaredValues.isPositive(load) ? load : null;
  }

  @Override
  public DemandContribution demand(DemandContext context) {
    NormativeValue quadro35 =
        context.tables().find(NormativeTableCode.Q35_APARTMENT_DEMAND, usefulArea);
    String term = getQuantity() + " × " + DeclaredValues.fixed(quadro35.value(), 2);

    return new DemandContribution(
        DemandComponent.RESIDENTIAL_UNITS,
        getName(),
        getQuantity(),
        isCompactUnit(),
        DeclaredValues.kva(quadro35.value().multiply(BigDecimal.valueOf(getQuantity()))),
        term,
        term,
        List.of(
            getName()
                + ": "
                + term
                + " kVA ("
                + quadro35.reference().identification()
                + ", "
                + quadro35.band()
                + " m²)"),
        List.of(quadro35.reference()));
  }

  /**
   * Item 6.27 is for three-phase units; a single-phase one is sized by its installed load
   * (DIS-NOR-030 item 6.28.1).
   */
  @Override
  public Optional<IndividualDemand> individualDemand(DemandContext context) {
    BigDecimal load = getUnitLoadKw();
    String installed = DeclaredValues.fixed(load, 2) + " kW";
    if (!isThreePhase()) {
      BigDecimal demand = DeclaredValues.kva(load);
      return Optional.of(
          new IndividualDemand(
              getName(),
              getQuantity(),
              connectionType,
              load,
              demand,
              "carga instalada de " + installed,
              List.of(
                  getName()
                      + " ("
                      + connectionType.label().toLowerCase()
                      + "): carga instalada de "
                      + installed
                      + ", que define a categoria da unidade (DIS-NOR-030, item 6.28.1)"),
              List.of()));
    }

    // The apartment's motors follow its own connection, not the building's.
    DemandContext unit =
        new DemandContext(context.tables(), context.voltage(), ConnectionType.THREE_PHASE);
    List<ParcelDemand> parcels = LoadCategory.parcels(loads, 1, LoadUsage.APARTMENT, unit);
    BigDecimal demand =
        DeclaredValues.kva(
            parcels.stream().map(ParcelDemand::kva).reduce(BigDecimal.ZERO, BigDecimal::add));
    String formula = LoadCategory.sum(parcels) + " = " + DeclaredValues.fixed(demand, 2) + " kVA";
    List<String> lines = new ArrayList<>();
    lines.add(
        getName()
            + " (trifásico, carga instalada de "
            + installed
            + "): "
            + formula
            + " (DIS-NOR-030, item 6.27)");
    parcels.forEach(parcel -> lines.addAll(parcel.lines()));

    return Optional.of(
        new IndividualDemand(
            getName(),
            getQuantity(),
            connectionType,
            load,
            demand,
            formula,
            lines,
            DemandComponent.distinct(
                parcels.stream().flatMap(parcel -> parcel.references().stream()).toList())));
  }

  @Override
  public String summary() {
    List<String> parts = new ArrayList<>();
    parts.add(
        DeclaredValues.isPositive(usefulArea)
            ? DeclaredValues.decimal(usefulArea) + " m²"
            : "Área útil não informada");
    if (bedrooms != null) {
      parts.add(bedrooms + (bedrooms == 1 ? " quarto" : " quartos"));
    }
    if (connectionType != null) {
      parts.add(connectionType.label().toLowerCase());
    }
    return String.join(", ", parts) + " (DIS-NOR-053 Quadro 35)";
  }
}
