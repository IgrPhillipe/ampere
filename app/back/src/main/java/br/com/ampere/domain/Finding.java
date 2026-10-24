package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Objects;

/** Issue identified by an analyst during one review version of a project. */
@Entity
@Table(name = "finding")
public class Finding {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(nullable = false)
  private Project project;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, columnDefinition = "varchar(255) default 'ADJUSTMENT'")
  private FindingSeverity severity;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, columnDefinition = "varchar(255) default 'PROJECT_DATA'")
  private FindingStage stage;

  @ManyToOne(fetch = FetchType.LAZY)
  private ConsumerUnitGroup consumerUnitGroup;

  private String calculationStepCode;

  @Enumerated(EnumType.STRING)
  private DocumentType documentType;

  @Column(
      nullable = false,
      length = 2000,
      columnDefinition = "varchar(2000) default 'Apontamento pendente'")
  private String description;

  private String standardItem;

  /** Nullable only for findings inserted before review authorship existed. */
  @ManyToOne(fetch = FetchType.LAZY)
  private User author;

  @Column(
      nullable = false,
      updatable = false,
      columnDefinition = "timestamp with time zone default CURRENT_TIMESTAMP")
  private OffsetDateTime createdAt;

  @Column(nullable = false, columnDefinition = "integer default 1")
  private int version;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, columnDefinition = "varchar(255) default 'OPEN'")
  private FindingStatus status;

  @Column(length = 2000)
  private String response;

  private OffsetDateTime respondedAt;

  protected Finding() {}

  public Finding(
      Project project,
      FindingSeverity severity,
      FindingStage stage,
      ConsumerUnitGroup consumerUnitGroup,
      String calculationStepCode,
      DocumentType documentType,
      String description,
      String standardItem,
      User author,
      int version) {
    if (version < 1) {
      throw new IllegalArgumentException("version must be positive");
    }
    this.project = Objects.requireNonNull(project, "project");
    this.severity = Objects.requireNonNull(severity, "severity");
    this.stage = Objects.requireNonNull(stage, "stage");
    this.consumerUnitGroup = consumerUnitGroup;
    this.calculationStepCode = blankToNull(calculationStepCode);
    this.documentType = documentType;
    this.description = requireText(description, "description");
    this.standardItem = blankToNull(standardItem);
    this.author = Objects.requireNonNull(author, "author");
    this.version = version;
    this.status = FindingStatus.DRAFT;
    this.createdAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  public void updateDraft(
      FindingSeverity severity,
      FindingStage stage,
      ConsumerUnitGroup consumerUnitGroup,
      String calculationStepCode,
      DocumentType documentType,
      String description,
      String standardItem) {
    this.severity = Objects.requireNonNull(severity, "severity");
    this.stage = Objects.requireNonNull(stage, "stage");
    this.consumerUnitGroup = consumerUnitGroup;
    this.calculationStepCode = blankToNull(calculationStepCode);
    this.documentType = documentType;
    this.description = requireText(description, "description");
    this.standardItem = blankToNull(standardItem);
  }

  /** The group was deleted: the finding stays, pointing to the stage only. */
  public void detachGroup() {
    consumerUnitGroup = null;
  }

  public void publish() {
    status = FindingStatus.OPEN;
  }

  public boolean isDraft() {
    return status == FindingStatus.DRAFT;
  }

  public boolean isOpenBlocking() {
    return severity == FindingSeverity.BLOCKING && status != FindingStatus.RESOLVED;
  }

  /** Still waiting on the designer: a draft about to be published, or an open finding. */
  public boolean isPending() {
    return status == FindingStatus.DRAFT || status == FindingStatus.OPEN;
  }

  /** Published and not yet accepted: the designer may answer it, again if reopened. */
  public boolean awaitsResponse() {
    return status != FindingStatus.DRAFT && status != FindingStatus.RESOLVED;
  }

  public void respond(FindingAnswer answer, String response, OffsetDateTime respondedAt) {
    String normalized = blankToNull(response);
    if (Objects.requireNonNull(answer, "answer") == FindingAnswer.CONTESTED && normalized == null) {
      throw new IllegalArgumentException("response is required when CONTESTED");
    }
    this.status = answer == FindingAnswer.FIXED ? FindingStatus.FIXED : FindingStatus.CONTESTED;
    this.response = normalized;
    this.respondedAt = Objects.requireNonNull(respondedAt, "respondedAt");
  }

  public void resolve(FindingResolution resolution) {
    status =
        Objects.requireNonNull(resolution, "resolution") == FindingResolution.ACCEPT
            ? FindingStatus.RESOLVED
            : FindingStatus.OPEN;
  }

  private static String requireText(String value, String field) {
    String normalized = blankToNull(value);
    if (normalized == null) {
      throw new IllegalArgumentException(field + " must not be blank");
    }
    return normalized;
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }

  public Long getId() {
    return id;
  }

  public Project getProject() {
    return project;
  }

  public FindingSeverity getSeverity() {
    return severity;
  }

  public FindingStage getStage() {
    return stage;
  }

  public ConsumerUnitGroup getConsumerUnitGroup() {
    return consumerUnitGroup;
  }

  public String getCalculationStepCode() {
    return calculationStepCode;
  }

  public DocumentType getDocumentType() {
    return documentType;
  }

  public String getDescription() {
    return description;
  }

  public String getStandardItem() {
    return standardItem;
  }

  public User getAuthor() {
    return author;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public int getVersion() {
    return version;
  }

  public FindingStatus getStatus() {
    return status;
  }

  public String getResponse() {
    return response;
  }

  public OffsetDateTime getRespondedAt() {
    return respondedAt;
  }
}
