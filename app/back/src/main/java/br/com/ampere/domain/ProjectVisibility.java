package br.com.ampere.domain;

/**
 * Which projects a role reaches: the designer their own, the analyst the submitted, the admin all.
 */
public enum ProjectVisibility {
  OWN,
  SUBMITTED,
  ALL
}
