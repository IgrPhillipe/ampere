package br.com.ampere.dto;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import java.time.OffsetDateTime;

public record ReviewDecisionResponse(
    Long projectId, ProjectStatus status, String opinion, OffsetDateTime reviewedAt) {

  public static ReviewDecisionResponse from(Project project) {
    return new ReviewDecisionResponse(
        project.getId(), project.getStatus(), project.getReviewOpinion(), project.getReviewedAt());
  }
}
