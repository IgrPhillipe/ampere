package br.com.ampere.domain;

/** Which projects a role reaches: its own, the submitted ones assigned to it, or all of them. */
public enum ProjectVisibility {
  OWN,
  ASSIGNED,
  ALL
}
