package br.com.ampere.domain;

/** Narrows the project listing by the findings still waiting for the designer. */
public enum OpenFindingsFilter {
  BLOCKING_OPEN,
  ANY_OPEN,
  NONE_OPEN
}
