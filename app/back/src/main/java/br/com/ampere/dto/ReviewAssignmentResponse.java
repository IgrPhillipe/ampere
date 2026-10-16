package br.com.ampere.dto;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.User;

public record ReviewAssignmentResponse(
    String projectId, String reviewerId, String reviewerName, String reviewerEmail) {

  public static ReviewAssignmentResponse from(Project project) {
    User reviewer = project.getReviewer();
    return new ReviewAssignmentResponse(
        String.valueOf(project.getId()),
        String.valueOf(reviewer.getId()),
        reviewer.getName(),
        reviewer.getEmail());
  }
}
