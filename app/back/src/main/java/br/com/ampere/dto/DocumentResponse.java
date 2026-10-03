package br.com.ampere.dto;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.ProjectDocument;
import java.time.OffsetDateTime;

/**
 * Representacao de um documento no JSON de resposta.
 *
 * <p>Nao inclui o conteudo binario (byte[]) — so os metadados. O download do PDF e feito por outro
 * endpoint se necessario.
 */
public record DocumentResponse(
    String id,
    DocumentType type,
    String typeLabel,
    String filename,
    Long fileSize,
    OffsetDateTime uploadedAt) {

  // Converte a entidade JPA para o DTO de resposta.
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
