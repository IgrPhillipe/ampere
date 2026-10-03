package br.com.ampere.dto;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.ProjectDocument;
import java.time.OffsetDateTime;

public record DocumentResponse(
    String id,
    DocumentType type,
    String typeLabel,
    String filename,
    Long fileSize,
    OffsetDateTime uploadedAt) {

  public static DocumentResponse from(ProjectDocument document) {
    return new DocumentResponse(
        String.valueOf(document.getId()),
        document.getType(),
        document.getType().label(),
        document.getFilename(),
        document.getFileSize(),
        document.getUploadedAt());
  }
}
