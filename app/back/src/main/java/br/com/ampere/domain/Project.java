package br.com.ampere.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "project")
public class Project {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
  private BuildingType buildingType;

  @ManyToOne private Standard standard;

  protected Project() {}

  public Project(String name, BuildingType buildingType, Standard standard) {
    this.name = name;
    this.buildingType = buildingType;
    this.standard = standard;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public BuildingType getBuildingType() {
    return buildingType;
  }

  public void setBuildingType(BuildingType buildingType) {
    this.buildingType = buildingType;
  }

  public Standard getStandard() {
    return standard;
  }

  public void setStandard(Standard standard) {
    this.standard = standard;
  }
}
