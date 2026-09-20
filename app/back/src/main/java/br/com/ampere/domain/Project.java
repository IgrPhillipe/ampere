package br.com.ampere.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** Electrical project submitted through AMPERE. */
@Entity
@Table(name = "project")
public class Project {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String address;

  @Column(nullable = false)
  private String municipality;

  @Column(nullable = false, unique = true)
  private String protocol;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ProjectStatus status;

  @OneToOne(
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY,
      optional = false)
  @JoinColumn(name = "building_type_id", nullable = false)
  private BuildingType buildingType;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "project_standard",
      joinColumns = @JoinColumn(name = "project_id"),
      inverseJoinColumns = @JoinColumn(name = "standard_id"))
  @OrderBy("name")
  private final List<Standard> standards = new ArrayList<>();

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  protected Project() {}

  public Project(
      String name,
      String address,
      String municipality,
      String protocol,
      ProjectStatus status,
      BuildingType buildingType,
      List<Standard> standards) {
    this.name = name;
    this.address = address;
    this.municipality = municipality;
    this.protocol = protocol;
    this.status = status;
    this.buildingType = Objects.requireNonNull(buildingType, "buildingType");
    this.standards.addAll(standards);
    this.updatedAt = LocalDateTime.now();
  }

  /** A newly created project: a draft, with the protocol the system assigned it. */
  public static Project draft(
      String name,
      String address,
      String municipality,
      String protocol,
      BuildingType buildingType,
      List<Standard> standards) {
    return new Project(
        name, address, municipality, protocol, ProjectStatus.DRAFT, buildingType, standards);
  }

  @PrePersist
  @PreUpdate
  private void updateTimestamp() {
    updatedAt = LocalDateTime.now();
  }

  public void rename(String name, String address, String municipality) {
    this.name = name;
    this.address = address;
    this.municipality = municipality;
  }

  public void changeBuildingType(BuildingType buildingType) {
    this.buildingType = Objects.requireNonNull(buildingType, "buildingType");
  }

  public void applyStandards(List<Standard> standards) {
    this.standards.clear();
    this.standards.addAll(standards);
  }

  public boolean isDraft() {
    return status == ProjectStatus.DRAFT;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getAddress() {
    return address;
  }

  public String getMunicipality() {
    return municipality;
  }

  public String getProtocol() {
    return protocol;
  }

  public ProjectStatus getStatus() {
    return status;
  }

  public BuildingType getBuildingType() {
    return buildingType;
  }

  public List<Standard> getStandards() {
    return List.copyOf(standards);
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }
}
