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
import jakarta.persistence.UniqueConstraint;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Objects;

/** A PDF attached to a project. One per type, kept in the database until there is a storage. */
@Entity
@Table(
    name = "project_document",
    uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "type"}))
public class ProjectDocument {

  private static final byte[] PDF_SIGNATURE = "%PDF-".getBytes(StandardCharsets.US_ASCII);

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private DocumentType type;

  @Column(nullable = false)
  private String filename;

  @Column(nullable = false, columnDefinition = "bytea")
  private byte[] data;

  @Column(nullable = false)
  private Long fileSize;

  @Column(nullable = false)
  private OffsetDateTime uploadedAt;

  protected ProjectDocument() {}

  public ProjectDocument(Project project, DocumentType type, String filename, byte[] data) {
    this.project = Objects.requireNonNull(project, "project");
    this.type = Objects.requireNonNull(type, "type");
    replace(filename, data);
  }

  public static boolean isPdf(byte[] content) {
    return content != null
        && content.length >= PDF_SIGNATURE.length
        && Arrays.equals(content, 0, PDF_SIGNATURE.length, PDF_SIGNATURE, 0, PDF_SIGNATURE.length);
  }

  public void replace(String filename, byte[] data) {
    this.filename = Objects.requireNonNull(filename, "filename");
    this.data = Objects.requireNonNull(data, "data");
    this.fileSize = (long) data.length;
    this.uploadedAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  public boolean belongsTo(Long projectId) {
    return project.getId().equals(projectId);
  }

  public Long getId() {
    return id;
  }

  public Project getProject() {
    return project;
  }

  public DocumentType getType() {
    return type;
  }

  public String getFilename() {
    return filename;
  }

  public byte[] getData() {
    return data;
  }

  public Long getFileSize() {
    return fileSize;
  }

  public OffsetDateTime getUploadedAt() {
    return uploadedAt;
  }
}
