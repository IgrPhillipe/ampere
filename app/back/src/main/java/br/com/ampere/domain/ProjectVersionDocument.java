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
import java.util.Objects;
import org.hibernate.annotations.Immutable;

/**
 * A copy of an attachment as it was when the version was sent. The project's own document may be
 * replaced afterwards, while a rejected project is corrected.
 */
@Entity
@Immutable
@Table(name = "project_version_document")
public class ProjectVersionDocument {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "version_id", nullable = false, updatable = false)
  private ProjectVersion version;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, updatable = false)
  private DocumentType type;

  @Column(nullable = false, updatable = false)
  private String filename;

  @Column(nullable = false, updatable = false, columnDefinition = "bytea")
  private byte[] data;

  @Column(nullable = false, updatable = false)
  private Long fileSize;

  @Column(nullable = false, updatable = false)
  private OffsetDateTime uploadedAt;

  protected ProjectVersionDocument() {}

  public ProjectVersionDocument(ProjectVersion version, ProjectDocument document) {
    this.version = Objects.requireNonNull(version, "version");
    this.type = document.getType();
    this.filename = document.getFilename();
    this.data = document.getData().clone();
    this.fileSize = document.getFileSize();
    this.uploadedAt = document.getUploadedAt();
  }

  public Long getId() {
    return id;
  }

  public ProjectVersion getVersion() {
    return version;
  }

  public DocumentType getType() {
    return type;
  }

  public String getFilename() {
    return filename;
  }

  public byte[] getData() {
    return data.clone();
  }

  public Long getFileSize() {
    return fileSize;
  }

  public OffsetDateTime getUploadedAt() {
    return uploadedAt;
  }
}
