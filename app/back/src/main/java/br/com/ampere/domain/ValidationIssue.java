package br.com.ampere.domain;

public record ValidationIssue(IssueSeverity severity, String field, String message) {

  public static ValidationIssue missing(String field, String message) {
    return new ValidationIssue(IssueSeverity.MISSING_DATA, field, message);
  }

  public static ValidationIssue review(String field, String message) {
    return new ValidationIssue(IssueSeverity.REVIEW, field, message);
  }
}
