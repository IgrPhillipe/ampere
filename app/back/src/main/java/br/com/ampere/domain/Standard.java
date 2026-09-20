package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A published standard revision a calculation is carried out under. */
@Entity
@Table(name = "standard")
public class Standard {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String name;

  @Column(nullable = false)
  private String revision;

  protected Standard() {}

  public Standard(String name, String revision) {
    this.name = name;
    this.revision = revision;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getRevision() {
    return revision;
  }
}
