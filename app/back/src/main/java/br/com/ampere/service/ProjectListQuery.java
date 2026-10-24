package br.com.ampere.service;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.OpenFindingsFilter;
import br.com.ampere.domain.ProjectSort;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.SortDirection;
import java.time.LocalDate;
import java.util.Collection;

/** The filters and the sort of the project listing, already converted. */
public record ProjectListQuery(
    ProjectStatus status,
    String search,
    ProjectSort sort,
    SortDirection direction,
    Collection<BrazilianState> states,
    Collection<String> municipalities,
    LocalDate createdFrom,
    LocalDate createdTo,
    Collection<OpenFindingsFilter> findings) {

  public ProjectListQuery {
    states = FilterValues.setOf(states, "state");
    municipalities = FilterValues.setOf(municipalities, "municipality");
    findings = FilterValues.setOf(findings, "findings");
  }
}
