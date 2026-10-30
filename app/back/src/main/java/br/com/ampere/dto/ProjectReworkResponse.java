package br.com.ampere.dto;

import br.com.ampere.service.ProjectRework;

public record ProjectReworkResponse(
    Long cycleDays,
    int submittedVersions,
    long reviewCycles,
    long resolvedFindings,
    long openFindings,
    long redoneCalculationSteps) {

  public static ProjectReworkResponse from(ProjectRework rework) {
    return new ProjectReworkResponse(
        rework.cycleDays(),
        rework.submittedVersions(),
        rework.reviewCycles(),
        rework.resolvedFindings(),
        rework.openFindings(),
        rework.redoneCalculationSteps());
  }
}
