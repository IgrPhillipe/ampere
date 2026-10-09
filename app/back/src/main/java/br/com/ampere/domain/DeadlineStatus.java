package br.com.ampere.domain;

/** Where a project under review stands against its deadline. Calculated, never persisted. */
public enum DeadlineStatus {
  OVERDUE,
  DUE_TODAY,
  ON_TIME
}
