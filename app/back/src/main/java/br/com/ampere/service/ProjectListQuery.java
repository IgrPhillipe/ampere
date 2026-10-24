package br.com.ampere.service;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.OpenFindingsFilter;
import br.com.ampere.domain.ProjectSort;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.SortDirection;
import java.time.LocalDate;

/** The filters and the sort of the project listing, already converted. */
public record ProjectListQuery(
    ProjectStatus status,
    String search,
    ProjectSort sort,
    SortDirection direction,
    BrazilianState state,
    String municipality,
    LocalDate createdFrom,
    LocalDate createdTo,
    OpenFindingsFilter findings) {}
