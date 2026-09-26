package br.com.ampere.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * One run of the demand calculation, kept as it was: the standards change revision on their own
 * pace, and an old calculation keeps pointing at the revision it was made under.
 */
@Entity
@Table(name = "calculation")
public class Calculation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(nullable = false)
  private Project project;

  @Column(nullable = false)
  private OffsetDateTime calculatedAt;

  private String mainStandard;

  private String mainStandardRevision;

  private String secondaryStandard;

  private String secondaryStandardRevision;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private BuildingCategory buildingType;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private SupplyVoltage supplyVoltage;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ConnectionType connectionType;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EntranceStandard entranceStandard;

  @Column(nullable = false, columnDefinition = "text")
  private String inputSnapshot;

  @Column(nullable = false, columnDefinition = "text")
  private String appliedRules;

  private Integer residentialUnits;

  private BigDecimal residentialDemand;

  @Column(precision = 10, scale = 4)
  private BigDecimal coincidenceFactor;

  @Column(precision = 10, scale = 4)
  private BigDecimal safetyFactor;

  private String safetyFactorBand;

  @Column(nullable = false)
  private BigDecimal residentialDemandFinal;

  @Column(nullable = false)
  private BigDecimal serviceDemand;

  @Column(nullable = false)
  private BigDecimal commercialDemand;

  @Column(nullable = false)
  private BigDecimal evChargingDemand;

  @Column(nullable = false)
  private BigDecimal calculatedTotalDemand;

  // Null above the last band of Tabelas 1 and 2, which the distributor sizes case by case.
  private BigDecimal minimumTotalDemand;

  @Column(nullable = false)
  private BigDecimal finalTotalDemand;

  @Column(nullable = false)
  private Boolean minimumApplied;

  @Column(nullable = false)
  private BigDecimal currentAmps;

  private String serviceEntranceBand;

  private Integer serviceEntranceCircuits;

  private BigDecimal cableSectionMm2;

  private BigDecimal breakerAmps;

  // Eager: the controller maps the response after the transaction, with open-in-view off.
  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "calculation_step", joinColumns = @JoinColumn(name = "calculation_id"))
  @OrderColumn(name = "position")
  private List<CalculationStep> steps = new ArrayList<>();

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "calculation_check", joinColumns = @JoinColumn(name = "calculation_id"))
  @OrderColumn(name = "position")
  private List<CalculationCheck> checks = new ArrayList<>();

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(
      name = "calculation_applied_table",
      joinColumns = @JoinColumn(name = "calculation_id"))
  @OrderColumn(name = "position")
  private List<AppliedTable> appliedTables = new ArrayList<>();

  protected Calculation() {}

  public Calculation(Project project, DemandResult result, String inputSnapshot) {
    this.project = Objects.requireNonNull(project, "project");
    this.calculatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    this.inputSnapshot = Objects.requireNonNull(inputSnapshot, "inputSnapshot");

    BuildingType building = project.getBuildingType();
    this.buildingType = building.category();
    this.supplyVoltage = building.getVoltage();
    this.connectionType = building.getConnectionType();
    this.entranceStandard = building.getEntranceStandard();
    this.appliedRules =
        building.demandRules().stream()
            .map(
                rule ->
                    rule.component().symbol()
                        + ": "
                        + rule.method().label()
                        + ", "
                        + rule.prescribedBy().code()
                        + " item "
                        + rule.prescribedItem())
            .collect(Collectors.joining("\n"));
    project.getStandards().forEach(this::recordStandard);

    ResidentialTrace residential = result.residential();
    if (residential != null) {
      this.residentialUnits = residential.apartments();
      this.residentialDemand = residential.residentialDemand();
      this.coincidenceFactor = residential.coincidenceFactor();
      this.safetyFactor = residential.safetyFactor();
      this.safetyFactorBand = residential.safetyFactorBand();
    }
    this.residentialDemandFinal = result.valueOf(DemandComponent.RESIDENTIAL_UNITS);
    this.serviceDemand = result.valueOf(DemandComponent.CONDOMINIUM_SERVICES);
    this.commercialDemand = result.valueOf(DemandComponent.NON_RESIDENTIAL_UNITS);
    this.evChargingDemand = result.valueOf(DemandComponent.EV_CHARGING);
    this.calculatedTotalDemand = result.calculatedKva();
    this.minimumTotalDemand = result.minimumKva();
    this.finalTotalDemand = result.finalKva();
    this.minimumApplied = result.minimumApplied();

    this.currentAmps = result.currentAmps();
    ServiceEntrance entrance = result.serviceEntrance();
    if (entrance != null) {
      this.serviceEntranceBand = entrance.band();
      this.serviceEntranceCircuits = entrance.circuits();
      this.cableSectionMm2 = entrance.cableSectionMm2();
      this.breakerAmps = entrance.breakerAmps();
    }

    result.steps().forEach(step -> steps.add(new CalculationStep(step)));
    checks.addAll(result.checks());
    result.appliedTables().forEach(reference -> appliedTables.add(new AppliedTable(reference)));
  }

  private void recordStandard(Standard standard) {
    if (StandardName.DIS_NOR_053.code().equals(standard.getName())) {
      this.mainStandard = standard.getName();
      this.mainStandardRevision = standard.getRevision();
    } else {
      this.secondaryStandard = standard.getName();
      this.secondaryStandardRevision = standard.getRevision();
    }
  }

  public Long getId() {
    return id;
  }

  public Project getProject() {
    return project;
  }

  public OffsetDateTime getCalculatedAt() {
    return calculatedAt;
  }

  public String getMainStandard() {
    return mainStandard;
  }

  public String getMainStandardRevision() {
    return mainStandardRevision;
  }

  public String getSecondaryStandard() {
    return secondaryStandard;
  }

  public String getSecondaryStandardRevision() {
    return secondaryStandardRevision;
  }

  public BuildingCategory getBuildingType() {
    return buildingType;
  }

  public SupplyVoltage getSupplyVoltage() {
    return supplyVoltage;
  }

  public ConnectionType getConnectionType() {
    return connectionType;
  }

  public EntranceStandard getEntranceStandard() {
    return entranceStandard;
  }

  public String getInputSnapshot() {
    return inputSnapshot;
  }

  public String getAppliedRules() {
    return appliedRules;
  }

  public Integer getResidentialUnits() {
    return residentialUnits;
  }

  public BigDecimal getResidentialDemand() {
    return residentialDemand;
  }

  public BigDecimal getCoincidenceFactor() {
    return coincidenceFactor;
  }

  public BigDecimal getSafetyFactor() {
    return safetyFactor;
  }

  public String getSafetyFactorBand() {
    return safetyFactorBand;
  }

  public BigDecimal getResidentialDemandFinal() {
    return residentialDemandFinal;
  }

  public BigDecimal getServiceDemand() {
    return serviceDemand;
  }

  public BigDecimal getCommercialDemand() {
    return commercialDemand;
  }

  public BigDecimal getEvChargingDemand() {
    return evChargingDemand;
  }

  public BigDecimal getCalculatedTotalDemand() {
    return calculatedTotalDemand;
  }

  public BigDecimal getMinimumTotalDemand() {
    return minimumTotalDemand;
  }

  public BigDecimal getFinalTotalDemand() {
    return finalTotalDemand;
  }

  public boolean isMinimumApplied() {
    return Boolean.TRUE.equals(minimumApplied);
  }

  public BigDecimal getCurrentAmps() {
    return currentAmps;
  }

  public String getServiceEntranceBand() {
    return serviceEntranceBand;
  }

  public Integer getServiceEntranceCircuits() {
    return serviceEntranceCircuits;
  }

  public BigDecimal getCableSectionMm2() {
    return cableSectionMm2;
  }

  public BigDecimal getBreakerAmps() {
    return breakerAmps;
  }

  public List<CalculationStep> getSteps() {
    return List.copyOf(steps);
  }

  public List<CalculationCheck> getChecks() {
    return List.copyOf(checks);
  }

  public List<AppliedTable> getAppliedTables() {
    return List.copyOf(appliedTables);
  }
}
