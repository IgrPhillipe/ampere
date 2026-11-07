package br.com.ampere.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;
import java.util.Objects;
import org.hibernate.annotations.Immutable;

/**
 * The immutable record of one submission: who sent it, when, what changed, the calculation it
 * carried, the documents attached and the memorial PDF issued with it. Nothing here is ever
 * updated, so the memorial a reviewer reads is the one the designer sent.
 */
@Entity
@Immutable
@Table(
    name = "project_version",
    uniqueConstraints = {
      @UniqueConstraint(columnNames = {"project_id", "number"}),
      @UniqueConstraint(columnNames = {"verificationCode"}),
      @UniqueConstraint(columnNames = {"memorialSha256"})
    })
public class ProjectVersion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "project_id", nullable = false, updatable = false)
  private Project project;

  @Column(nullable = false, updatable = false)
  private int number;

  @Column(nullable = false, updatable = false)
  private OffsetDateTime submittedAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id", updatable = false)
  private User author;

  @Column(length = 2000, updatable = false)
  private String changeSummary;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "calculation_id", nullable = false, updatable = false)
  private Calculation calculation;

  @OneToOne(
      cascade = {CascadeType.PERSIST, CascadeType.REMOVE},
      fetch = FetchType.LAZY,
      optional = false)
  @JoinColumn(name = "memorial_id", nullable = false, updatable = false)
  private ProjectVersionMemorial memorial;

  /** SHA-256 of the stored memorial file, in lowercase hex. */
  @Column(nullable = false, length = 64, updatable = false)
  private String memorialSha256;

  /** Printed in the memorial footer, so a paper copy can be checked without the file. */
  @Column(nullable = false, length = 19, updatable = false)
  private String verificationCode;

  protected ProjectVersion() {}

  public ProjectVersion(
      Project project,
      int number,
      OffsetDateTime submittedAt,
      User author,
      String changeSummary,
      Calculation calculation,
      ProjectVersionMemorial memorial,
      String memorialSha256,
      String verificationCode) {
    this.project = Objects.requireNonNull(project, "project");
    this.number = number;
    this.submittedAt = Objects.requireNonNull(submittedAt, "submittedAt");
    this.author = author;
    this.changeSummary =
        changeSummary == null || changeSummary.isBlank() ? null : changeSummary.trim();
    this.calculation = Objects.requireNonNull(calculation, "calculation");
    this.memorial = Objects.requireNonNull(memorial, "memorial");
    this.memorialSha256 = Objects.requireNonNull(memorialSha256, "memorialSha256");
    this.verificationCode = Objects.requireNonNull(verificationCode, "verificationCode");
  }

  public Long getId() {
    return id;
  }

  public Project getProject() {
    return project;
  }

  public int getNumber() {
    return number;
  }

  public OffsetDateTime getSubmittedAt() {
    return submittedAt;
  }

  public User getAuthor() {
    return author;
  }

  public String getChangeSummary() {
    return changeSummary;
  }

  public Calculation getCalculation() {
    return calculation;
  }

  public ProjectVersionMemorial getMemorial() {
    return memorial;
  }

  public String getMemorialSha256() {
    return memorialSha256;
  }

  public String getVerificationCode() {
    return verificationCode;
  }
}
