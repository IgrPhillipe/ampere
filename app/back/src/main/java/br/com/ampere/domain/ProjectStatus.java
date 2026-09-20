package br.com.ampere.domain;

/** Current stage of a project in the submission and review workflow. */
public enum ProjectStatus {
  DRAFT,
  AWAITING_SUBMISSION,
  UNDER_REVIEW,
  REJECTED,
  APPROVED
}
