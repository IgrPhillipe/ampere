package br.com.ampere.service;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;

/** The fields of a finding, already converted. The service does not know about DTOs. */
public record FindingParameters(
    FindingSeverity severity,
    FindingStage stage,
    Long consumerUnitGroupId,
    String calculationStepCode,
    DocumentType documentType,
    String description,
    String standardItem) {

  /** Each stage takes only its own reference: the group, the demand step or the document type. */
  boolean referencesFitStage() {
    return (consumerUnitGroupId == null || stage == FindingStage.CONSUMER_UNITS)
        && (calculationStepCode == null || stage == FindingStage.CALCULATION)
        && (documentType == null || stage == FindingStage.DOCUMENTS);
  }
}
