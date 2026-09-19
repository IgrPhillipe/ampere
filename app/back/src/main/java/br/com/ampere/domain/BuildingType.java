package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;

@Entity
@Table(name = "building_type")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "type")
public abstract class BuildingType {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Double voltage;

  @Column(name = "entrance_standard", nullable = false)
  private String entranceStandard;

  protected BuildingType() {}

  protected BuildingType(Double voltage, String entranceStandard) {
    this.voltage = voltage;
    this.entranceStandard = entranceStandard;
  }

  public Long getId() {
    return id;
  }

  public Double getVoltage() {
    return voltage;
  }

  public void setVoltage(Double voltage) {
    this.voltage = voltage;
  }

  public String getEntranceStandard() {
    return entranceStandard;
  }

  public void setEntranceStandard(String entranceStandard) {
    this.entranceStandard = entranceStandard;
  }

  public abstract String applicableStandard();
}
