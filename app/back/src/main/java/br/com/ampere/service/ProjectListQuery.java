package br.com.ampere.service;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.OpenFindingsFilter;
import br.com.ampere.domain.ProjectSort;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.SortDirection;
import java.time.LocalDate;
import java.util.Set;

/** The filters and the sort of the project listing, already converted. */
public record ProjectListQuery(
    ProjectStatus status,
    String search,
    ProjectSort sort,
    SortDirection direction,
    Set<BrazilianState> states,
    Set<String> municipalities,
    LocalDate createdFrom,
    LocalDate createdTo,
    Set<OpenFindingsFilter> findings) {

  /** A missing list filters nothing, like an empty one. */
  public ProjectListQuery {
    states = states == null ? Set.of() : Set.copyOf(states);
    municipalities = municipalities == null ? Set.of() : Set.copyOf(municipalities);
    findings = findings == null ? Set.of() : Set.copyOf(findings);
  }
}
