package br.com.ampere.domain;

public enum IssueSeverity {
  REVIEW(GroupStatus.REVIEW),
  MISSING_DATA(GroupStatus.MISSING_DATA);

  private final GroupStatus status;

  IssueSeverity(GroupStatus status) {
    this.status = status;
  }

  public GroupStatus status() {
    return status;
  }
}
