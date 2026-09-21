package br.com.ampere.domain;

import br.com.ampere.utils.SearchTerms;
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
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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

  /** Stored with an offset so the API always answers with one. */
  @Column(nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @Column(nullable = false)
  private OffsetDateTime updatedAt;

  @Column(nullable = false)
  private String searchIndex;

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
    this.createdAt = now();
    this.updatedAt = this.createdAt;
    this.searchIndex = searchIndexOf(name, protocol);
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
  private void onPersist() {
    createdAt = now();
    updatedAt = createdAt;
    searchIndex = searchIndexOf(name, protocol);
  }

  @PreUpdate
  private void onUpdate() {
    updatedAt = now();
    searchIndex = searchIndexOf(name, protocol);
  }

  private static OffsetDateTime now() {
    return OffsetDateTime.now(ZoneOffset.UTC);
  }

  private static String searchIndexOf(String name, String protocol) {
    return SearchTerms.fold(name + " " + protocol);
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

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public String getSearchIndex() {
    return searchIndex;
  }
}
