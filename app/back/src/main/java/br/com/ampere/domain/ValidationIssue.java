package br.com.ampere.domain;

/**
 * Something a group still lacks before the demand can be calculated.
 *
 * @param field the input the designer has to fix, so the screen can take them to it
 */
public record ValidationIssue(IssueSeverity severity, String field, String message) {

  public static ValidationIssue missing(String field, String message) {
    return new ValidationIssue(IssueSeverity.MISSING_DATA, field, message);
  }

  public static ValidationIssue review(String field, String message) {
    return new ValidationIssue(IssueSeverity.REVIEW, field, message);
  }
}
