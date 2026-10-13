package br.com.ampere.dto;

import br.com.ampere.domain.Finding;
import br.com.ampere.domain.User;
import java.time.OffsetDateTime;

public record FindingResponse(
    String id,
    String projectId,
    String severity,
    String stage,
    String consumerUnitGroupId,
    String calculationStepCode,
    String documentType,
    String description,
    String standardItem,
    String authorId,
    String authorName,
    OffsetDateTime createdAt,
    int version,
    String status) {

  public static FindingResponse from(Finding finding) {
    User author = finding.getAuthor();
    return new FindingResponse(
        String.valueOf(finding.getId()),
        String.valueOf(finding.getProject().getId()),
        finding.getSeverity().name(),
        finding.getStage().name(),
        finding.getConsumerUnitGroup() == null
            ? null
            : String.valueOf(finding.getConsumerUnitGroup().getId()),
        finding.getCalculationStepCode(),
        finding.getDocumentType() == null ? null : finding.getDocumentType().name(),
        finding.getDescription(),
        finding.getStandardItem(),
        author == null ? null : String.valueOf(author.getId()),
        author == null ? null : author.getName(),
        finding.getCreatedAt(),
        finding.getVersion(),
        finding.getStatus().name());
  }
}
