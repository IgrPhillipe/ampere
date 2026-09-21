package br.com.ampere.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Pending issue identified during the review of a project. */
@Entity
@Table(name = "finding")
public class Finding {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(nullable = false)
  private Project project;

  protected Finding() {}

  public Finding(Project project) {
    this.project = project;
  }

  public Long getId() {
    return id;
  }

  public Project getProject() {
    return project;
  }
}
