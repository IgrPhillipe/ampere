package br.com.ampere.domain;

import br.com.ampere.utils.SearchTerms;
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
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

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

  /**
   * Stored with an offset so the API always answers with one. {@code LocalDateTime} left the client
   * guessing: the container runs in UTC and the browser in America/Recife, so a relative label read
   * three hours into the future.
   */
  @Column(nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @Column(nullable = false)
  private OffsetDateTime updatedAt;

  /**
   * Name and protocol folded to one accent-free, lowercase string, so the listing search can be
   * accent-insensitive with a plain {@code LIKE}. Postgres could do it with {@code unaccent}, but
   * that is an extension and there is no migration tool to create it — see pendency 16.
   */
  @Column(nullable = false)
  private String searchIndex;

  protected Project() {}

  public Project(
      String name, String address, String municipality, String protocol, ProjectStatus status) {
    this.name = name;
    this.address = address;
    this.municipality = municipality;
    this.protocol = protocol;
    this.status = status;
    this.createdAt = now();
    this.updatedAt = this.createdAt;
    this.searchIndex = searchIndexOf(name, protocol);
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
