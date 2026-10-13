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
  @Column(nullable = false)
  private FindingSeverity severity;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private FindingStage stage;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "consumer_unit_group_id")
  private ConsumerUnitGroup consumerUnitGroup;

  private String calculationStepCode;

  @Enumerated(EnumType.STRING)
  private DocumentType documentType;

  @Column(nullable = false, length = 2000)
  private String description;

  private String standardItem;

  /** Nullable only for findings inserted before review authorship existed. */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id")
  private User author;

  @Column(nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @Column(nullable = false)
  private int version;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private FindingStatus status;

  protected Finding() {}

  /** Compatibility constructor for findings created by an older development seed. */
  public Finding(Project project) {
    this(
        project,
        FindingSeverity.ADJUSTMENT,
        FindingStage.PROJECT_DATA,
        null,
        null,
        null,
        "Apontamento pendente",
        null,
        null,
        Math.max(1, project.getReviewCycle()),
        FindingStatus.OPEN);
  }

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
    this(
        project,
        severity,
        stage,
        consumerUnitGroup,
        calculationStepCode,
        documentType,
        description,
        standardItem,
        Objects.requireNonNull(author, "author"),
        version,
        FindingStatus.DRAFT);
  }

  private Finding(
      Project project,
      FindingSeverity severity,
      FindingStage stage,
      ConsumerUnitGroup consumerUnitGroup,
      String calculationStepCode,
      DocumentType documentType,
      String description,
      String standardItem,
      User author,
      int version,
      FindingStatus status) {
    this.project = Objects.requireNonNull(project, "project");
    this.severity = Objects.requireNonNull(severity, "severity");
    this.stage = Objects.requireNonNull(stage, "stage");
    this.consumerUnitGroup = consumerUnitGroup;
    this.calculationStepCode = blankToNull(calculationStepCode);
    this.documentType = documentType;
    this.description = requireText(description, "description");
    this.standardItem = blankToNull(standardItem);
    this.author = author;
    if (version < 1) {
      throw new IllegalArgumentException("version must be positive");
    }
    this.version = version;
    this.status = Objects.requireNonNull(status, "status");
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
    requireDraft();
    this.severity = Objects.requireNonNull(severity, "severity");
    this.stage = Objects.requireNonNull(stage, "stage");
    this.consumerUnitGroup = consumerUnitGroup;
    this.calculationStepCode = blankToNull(calculationStepCode);
    this.documentType = documentType;
    this.description = requireText(description, "description");
    this.standardItem = blankToNull(standardItem);
  }

  public void publish() {
    requireDraft();
    status = FindingStatus.OPEN;
  }

  public boolean isDraft() {
    return status == FindingStatus.DRAFT;
  }

  public boolean isOpenBlocking() {
    return severity == FindingSeverity.BLOCKING && status != FindingStatus.RESOLVED;
  }

  private void requireDraft() {
    if (!isDraft()) {
      throw new IllegalStateException("Only draft findings can be changed.");
    }
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
}
