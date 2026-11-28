package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;
import java.util.Objects;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/**
 * Registry of every official file handed out: its SHA-256 and printed code verify the exact file
 * later. Memorials issued before the registry are still found in their version.
 */
@Entity
@Immutable
@Table(
    name = "issued_document",
    uniqueConstraints = {
      @UniqueConstraint(columnNames = {"sha256"}),
      @UniqueConstraint(columnNames = {"verificationCode"})
    },
    indexes = @Index(columnList = "project_id"))
public class IssuedDocument {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 40, updatable = false)
  private IssuedDocumentType type;

  // Goes with the project: only a draft (spreadsheets) or the demo reset deletes one.
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "project_id", nullable = false, updatable = false)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private Project project;

  /** Null for a spreadsheet of a calculation not yet submitted. */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "version_id", updatable = false)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private ProjectVersion version;

  @Column(nullable = false, updatable = false)
  private String filename;

  @Column(nullable = false, length = 64, updatable = false)
  private String sha256;

  @Column(nullable = false, length = 19, updatable = false)
  private String verificationCode;

  @Column(nullable = false, updatable = false)
  private OffsetDateTime issuedAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "issued_by_id", updatable = false)
  private User issuedBy;

  /** SHA-256 of the certificate that signed the file; null for an unsigned type. */
  @Column(length = 64, updatable = false)
  private String signerCertificateSha256;

  protected IssuedDocument() {}

  public IssuedDocument(
      IssuedDocumentType type,
      Project project,
      ProjectVersion version,
      String filename,
      String sha256,
      String verificationCode,
      OffsetDateTime issuedAt,
      User issuedBy,
      String signerCertificateSha256) {
    this.type = Objects.requireNonNull(type, "type");
    this.project = Objects.requireNonNull(project, "project");
    this.version = version;
    this.filename = Objects.requireNonNull(filename, "filename");
    this.sha256 = Objects.requireNonNull(sha256, "sha256");
    this.verificationCode = Objects.requireNonNull(verificationCode, "verificationCode");
    this.issuedAt = Objects.requireNonNull(issuedAt, "issuedAt");
    this.issuedBy = issuedBy;
    this.signerCertificateSha256 = signerCertificateSha256;
  }

  public Long getId() {
    return id;
  }

  public IssuedDocumentType getType() {
    return type;
  }

  public Project getProject() {
    return project;
  }

  public ProjectVersion getVersion() {
    return version;
  }

  public String getFilename() {
    return filename;
  }

  public String getSha256() {
    return sha256;
  }

  public String getVerificationCode() {
    return verificationCode;
  }

  public OffsetDateTime getIssuedAt() {
    return issuedAt;
  }

  public User getIssuedBy() {
    return issuedBy;
  }

  public String getSignerCertificateSha256() {
    return signerCertificateSha256;
  }

  public boolean isSigned() {
    return signerCertificateSha256 != null;
  }
}
