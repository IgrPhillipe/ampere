package br.com.ampere.dto;

import br.com.ampere.domain.IssueSeverity;
import br.com.ampere.domain.ValidationIssue;

/** What a group still lacks. {@code field} points at the input to fix, e.g. items[0].power. */
public record ValidationIssueResponse(IssueSeverity severity, String field, String message) {

  public static ValidationIssueResponse from(ValidationIssue issue) {
    return new ValidationIssueResponse(issue.severity(), issue.field(), issue.message());
  }
}
