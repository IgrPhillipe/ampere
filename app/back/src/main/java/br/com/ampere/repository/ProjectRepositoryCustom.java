package br.com.ampere.repository;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectSort;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ReviewQueueSort;
import br.com.ampere.domain.SortDirection;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProjectRepositoryCustom {

  Page<Project> searchAccessibleProjects(
      ProjectStatus status,
      String search,
      Long ownerId,
      boolean admin,
      String municipality,
      OffsetDateTime createdFrom,
      OffsetDateTime createdTo,
      boolean hasBlocking,
      ProjectSort sort,
      SortDirection direction,
      Pageable pageable);

  Page<Project> searchReviewQueue(
      ProjectStatus status,
      String search,
      boolean dueSoon,
      OffsetDateTime submittedBefore,
      boolean highDemand,
      BigDecimal minimumDemand,
      boolean reanalysis,
      String municipality,
      String reviewer,
      ReviewQueueSort sort,
      SortDirection direction,
      Pageable pageable);
}
