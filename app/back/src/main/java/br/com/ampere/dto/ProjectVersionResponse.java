package br.com.ampere.dto;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.ProjectVersion;
import br.com.ampere.repository.ProjectVersionDocumentRepository;
import br.com.ampere.service.ProjectVersionService;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record ProjectVersionResponse(
    int number,
    OffsetDateTime submittedAt,
    String authorName,
    String changeSummary,
    BigDecimal demandKva,
    List<VersionDocumentResponse> documents,
    String memorialSha256,
    String verificationCode) {

  public record VersionDocumentResponse(
      DocumentType type, String typeLabel, String filename, Long fileSize) {

    static VersionDocumentResponse from(ProjectVersionDocumentRepository.Summary document) {
      return new VersionDocumentResponse(
          document.getType(),
          document.getType().label(),
          document.getFilename(),
          document.getFileSize());
    }
  }

  public static ProjectVersionResponse from(ProjectVersionService.Entry entry) {
    ProjectVersion version = entry.version();

    return new ProjectVersionResponse(
        version.getNumber(),
        version.getSubmittedAt(),
        version.getAuthor() == null ? null : version.getAuthor().getName(),
        version.getChangeSummary(),
        version.getCalculation().getFinalTotalDemand(),
        entry.documents().stream().map(VersionDocumentResponse::from).toList(),
        version.getMemorialSha256(),
        version.getVerificationCode());
  }
}
