package br.com.ampere.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;
import java.util.Objects;
import org.hibernate.annotations.Immutable;

/** The memorial of a version approved with reservations; the one issued on submission stays. */
@Entity
@Immutable
@Table(
    name = "approval_memorial",
    uniqueConstraints = {
      @UniqueConstraint(columnNames = {"version_id"}),
      @UniqueConstraint(columnNames = {"verificationCode"}),
      @UniqueConstraint(columnNames = {"memorialSha256"})
    })
public class ApprovalMemorial {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "version_id", nullable = false, updatable = false)
  private ProjectVersion version;

  @OneToOne(
      cascade = {CascadeType.PERSIST, CascadeType.REMOVE},
      fetch = FetchType.LAZY,
      optional = false)
  @JoinColumn(name = "memorial_id", nullable = false, updatable = false)
  private ProjectVersionMemorial memorial;

  @Column(nullable = false, length = 64, updatable = false)
  private String memorialSha256;

  @Column(nullable = false, length = 19, updatable = false)
  private String verificationCode;

  @Column(nullable = false, updatable = false)
  private OffsetDateTime issuedAt;

  protected ApprovalMemorial() {}

  public ApprovalMemorial(
      ProjectVersion version,
      ProjectVersionMemorial memorial,
      String memorialSha256,
      String verificationCode,
      OffsetDateTime issuedAt) {
    this.version = Objects.requireNonNull(version, "version");
    this.memorial = Objects.requireNonNull(memorial, "memorial");
    this.memorialSha256 = Objects.requireNonNull(memorialSha256, "memorialSha256");
    this.verificationCode = Objects.requireNonNull(verificationCode, "verificationCode");
    this.issuedAt = Objects.requireNonNull(issuedAt, "issuedAt");
  }

  public Long getId() {
    return id;
  }

  public ProjectVersion getVersion() {
    return version;
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

  public OffsetDateTime getIssuedAt() {
    return issuedAt;
  }
}
