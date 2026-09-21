package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/** Technical parameters of a building, which decide how its demand is calculated. */
@Entity
@Table(name = "building_type")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "category")
public abstract class BuildingType {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Integer floors;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private SupplyVoltage voltage;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ConnectionType connectionType;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EntranceStandard entranceStandard;

  protected BuildingType() {}

  protected BuildingType(
      Integer floors,
      SupplyVoltage voltage,
      ConnectionType connectionType,
      EntranceStandard entranceStandard) {
    this.floors = Objects.requireNonNull(floors, "floors");
    this.voltage = Objects.requireNonNull(voltage, "voltage");
    this.connectionType = Objects.requireNonNull(connectionType, "connectionType");
    this.entranceStandard = Objects.requireNonNull(entranceStandard, "entranceStandard");
  }

  public Long getId() {
    return id;
  }

  public Integer getFloors() {
    return floors;
  }

  public SupplyVoltage getVoltage() {
    return voltage;
  }

  public ConnectionType getConnectionType() {
    return connectionType;
  }

  public EntranceStandard getEntranceStandard() {
    return entranceStandard;
  }

  public abstract BuildingCategory category();

  /** The shares that make up this building's demand. */
  public abstract List<DemandRule> demandRules();

  /** The standards this project is calculated under, derived from its own rules. */
  public final Set<StandardName> applicableStandards() {
    return demandRules().stream()
        .flatMap(rule -> Stream.of(rule.prescribedBy(), rule.methodFrom()))
        .collect(Collectors.toCollection(() -> EnumSet.noneOf(StandardName.class)));
  }
}
