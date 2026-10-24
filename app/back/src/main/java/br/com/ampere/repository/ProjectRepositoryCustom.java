package br.com.ampere.repository;

import br.com.ampere.domain.OpenFindingsFilter;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectSort;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ProjectVisibility;
import br.com.ampere.domain.ReviewQueueSort;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.domain.User;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/** Listings whose filters and sort column vary per request, so the query is built at runtime. */
public interface ProjectRepositoryCustom {

  Page<Project> searchAccessibleProjects(ProjectSearch search, Pageable pageable);

  Page<Project> searchReviewQueue(ReviewQueueSearch search, Pageable pageable);

  List<String> findAccessibleMunicipalities(Long userId, ProjectVisibility visibility);

  List<User> findAccessibleOwners(Long userId, ProjectVisibility visibility);

  List<StatusCount> countAccessiblePerStatus(Long userId, ProjectVisibility visibility);

  record StatusCount(ProjectStatus status, long total) {}

  /** A null or blank filter does not filter; {@code search} is already folded and escaped. */
  record ProjectSearch(
      Long userId,
      ProjectVisibility visibility,
      ProjectStatus status,
      String search,
      String municipality,
      OffsetDateTime createdFrom,
      OffsetDateTime createdBefore,
      OpenFindingsFilter findings,
      Long owner,
      ProjectSort sort,
      SortDirection direction) {}

  /** A null or blank filter does not filter; {@code search} is already folded and escaped. */
  record ReviewQueueSearch(
      String search,
      OffsetDateTime submittedBefore,
      BigDecimal demandAbove,
      boolean reanalysis,
      String municipality,
      Long reviewerId,
      boolean unassigned,
      ReviewQueueSort sort,
      SortDirection direction) {}
}
