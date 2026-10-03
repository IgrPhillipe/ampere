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
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Objects;

/**
 * Documento PDF anexado a um projeto (ART, diagrama unifilar ou planta de situacao).
 *
 * <p>Relacao N-1 com Project: um projeto pode ter varios documentos, mas apenas um de cada tipo
 * (garantido pela constraint UNIQUE em project_id + type).
 *
 * <p>O conteudo do PDF e armazenado como bytea no PostgreSQL. Para projetos em producao, poderia
 * migrar para S3/MinIO, mas para o escopo atual o banco atende.
 */
@Entity
@Table(
    name = "project_document",
    uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "type"}))
public class ProjectDocument {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Projeto ao qual este documento pertence.
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  // Tipo do documento: ART, DIAGRAMA_UNIFILAR ou PLANTA_DE_SITUACAO.
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private DocumentType type;

  // Nome original do arquivo enviado pelo usuario (ex: "art-projeto-123.pdf").
  @Column(nullable = false)
  private String filename;

  // Conteudo binario do PDF, armazenado como bytea no PostgreSQL.
  @Column(nullable = false, columnDefinition = "bytea")
  private byte[] data;

  // Tamanho em bytes, para exibir no front sem precisar carregar o conteudo.
  @Column(nullable = false)
  private Long fileSize;

  @Column(nullable = false)
  private OffsetDateTime uploadedAt;

  protected ProjectDocument() {}

  public ProjectDocument(Project project, DocumentType type, String filename, byte[] data) {
    this.project = Objects.requireNonNull(project, "project");
    this.type = Objects.requireNonNull(type, "type");
    this.filename = Objects.requireNonNull(filename, "filename");
    this.data = Objects.requireNonNull(data, "data");
    this.fileSize = (long) data.length;
    this.uploadedAt = OffsetDateTime.now(ZoneOffset.UTC);
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
