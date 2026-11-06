package br.com.ampere.domain;

/** What happened to the project that the notification reports. */
public enum NotificationType {
  PROJECT_APPROVED,
  PROJECT_REJECTED,
  FINDING_REOPENED,
  PROJECT_RESUBMITTED,
  REVIEW_DEADLINE_NEAR,
  REVIEW_OVERDUE,
  APPROVAL_EXPIRING
}
