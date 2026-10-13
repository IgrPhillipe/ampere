package br.com.ampere.service;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;

public record FindingParameters(
    FindingSeverity severity,
    FindingStage stage,
    Long consumerUnitGroupId,
    String calculationStepCode,
    DocumentType documentType,
    String description,
    String standardItem) {}
