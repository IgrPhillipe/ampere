package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

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

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  protected Project() {}

  public Project(
      String name, String address, String municipality, String protocol, ProjectStatus status) {
    this.name = name;
    this.address = address;
    this.municipality = municipality;
    this.protocol = protocol;
    this.status = status;
    this.updatedAt = LocalDateTime.now();
  }

  @PrePersist
  @PreUpdate
  private void updateTimestamp() {
    updatedAt = LocalDateTime.now();
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

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }
}
