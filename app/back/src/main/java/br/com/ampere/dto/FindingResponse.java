package br.com.ampere.dto;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.User;
import java.time.OffsetDateTime;

public record FindingResponse(
    String id,
    String projectId,
    FindingSeverity severity,
    FindingStage stage,
    String consumerUnitGroupId,
    String calculationStepCode,
    DocumentType documentType,
    String description,
    String standardItem,
    String authorId,
    String authorName,
    OffsetDateTime createdAt,
    int version,
    FindingStatus status) {

  public static FindingResponse from(Finding finding) {
    User author = finding.getAuthor();
    return new FindingResponse(
        String.valueOf(finding.getId()),
        String.valueOf(finding.getProject().getId()),
        finding.getSeverity(),
        finding.getStage(),
        finding.getConsumerUnitGroup() == null
            ? null
            : String.valueOf(finding.getConsumerUnitGroup().getId()),
        finding.getCalculationStepCode(),
        finding.getDocumentType(),
        finding.getDescription(),
        finding.getStandardItem(),
        author == null ? null : String.valueOf(author.getId()),
        author == null ? null : author.getName(),
        finding.getCreatedAt(),
        finding.getVersion(),
        finding.getStatus());
  }
}
