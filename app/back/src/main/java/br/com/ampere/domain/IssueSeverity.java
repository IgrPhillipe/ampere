package br.com.ampere.domain;

/** How a validation issue blocks the calculation: a value to confirm or a value to inform. */
public enum IssueSeverity {
  REVIEW(GroupStatus.REVIEW),
  MISSING_DATA(GroupStatus.MISSING_DATA);

  private final GroupStatus status;

  IssueSeverity(GroupStatus status) {
    this.status = status;
  }

  /** The status a group takes when this is its most serious issue. */
  public GroupStatus status() {
    return status;
  }
}
