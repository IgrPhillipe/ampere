package br.com.ampere.dto;

import br.com.ampere.domain.ApprovalMemorial;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.ProjectVersion;
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
    String verificationCode,
    ApprovalMemorialResponse approvalMemorial) {

  /** The memorial of an approval with reservations: another PDF, with a code of its own. */
  public record ApprovalMemorialResponse(
      String memorialSha256, String verificationCode, OffsetDateTime issuedAt) {

    static ApprovalMemorialResponse from(ApprovalMemorial approval) {
      return approval == null
          ? null
          : new ApprovalMemorialResponse(
              approval.getMemorialSha256(), approval.getVerificationCode(), approval.getIssuedAt());
    }
  }

  public record VersionDocumentResponse(
      DocumentType type, String typeLabel, String filename, Long fileSize) {

    static VersionDocumentResponse from(ProjectVersionService.DocumentSummary document) {
      return new VersionDocumentResponse(
          document.type(), document.type().label(), document.filename(), document.fileSize());
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
        version.getVerificationCode(),
        ApprovalMemorialResponse.from(entry.approval()));
  }
}
