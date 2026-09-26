package br.com.ampere.dto;

import br.com.ampere.domain.IssueSeverity;
import br.com.ampere.domain.ValidationIssue;

public record ValidationIssueResponse(IssueSeverity severity, String field, String message) {

  public static ValidationIssueResponse from(ValidationIssue issue) {
    return new ValidationIssueResponse(issue.severity(), issue.field(), issue.message());
  }
}
