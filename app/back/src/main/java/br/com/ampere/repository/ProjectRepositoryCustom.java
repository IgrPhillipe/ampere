package br.com.ampere.repository;

import br.com.ampere.domain.BrazilianState;
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
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/** Listings whose filters and sort column vary per request, so the query is built at runtime. */
public interface ProjectRepositoryCustom {

  Page<Project> searchAccessibleProjects(ProjectSearch search, Pageable pageable);

  Page<Project> searchReviewQueue(ReviewQueueSearch search, Pageable pageable);

  /** The designers of the projects the role reaches; {@code search} is folded and escaped. */
  Page<User> findAccessibleOwners(
      Long userId, ProjectVisibility visibility, String search, Pageable pageable);

  /** The designers with a project in the review queue; {@code search} is folded and escaped. */
  Page<User> findReviewQueueOwners(String search, Pageable pageable);

  List<StatusCount> countAccessiblePerStatus(Long userId, ProjectVisibility visibility);

  record StatusCount(ProjectStatus status, long total) {}

  /** An empty filter does not filter; {@code search} is already folded and escaped. */
  record ProjectSearch(
      Long userId,
      ProjectVisibility visibility,
      ProjectStatus status,
      String search,
      Collection<BrazilianState> states,
      Collection<String> municipalities,
      OffsetDateTime createdFrom,
      OffsetDateTime createdBefore,
      Collection<OpenFindingsFilter> findings,
      Long owner,
      ProjectSort sort,
      SortDirection direction) {}

  /** A null or empty filter does not filter; {@code search} is already folded and escaped. */
  record ReviewQueueSearch(
      String search,
      OffsetDateTime submittedBefore,
      BigDecimal demandAbove,
      boolean reanalysis,
      Collection<BrazilianState> states,
      Collection<String> municipalities,
      Long reviewerId,
      boolean unassigned,
      Long ownerId,
      ReviewQueueSort sort,
      SortDirection direction) {}
}
