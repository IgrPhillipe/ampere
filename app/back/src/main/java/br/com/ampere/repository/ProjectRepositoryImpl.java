package br.com.ampere.repository;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.Project;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.Collection;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public class ProjectRepositoryImpl implements ProjectRepositoryCustom {

  private static final String LATEST_CALCULATION =
      "(SELECT MAX(latest.id) FROM Calculation latest WHERE latest.project = project)";

  private static final String LATEST_DEMAND =
      "(SELECT c.finalTotalDemand FROM Calculation c WHERE c.id = " + LATEST_CALCULATION + ")";

  private static final String LATEST_WARNING_COUNT =
      """
      (SELECT COUNT(item) FROM Calculation c JOIN c.checks item
        WHERE c.id = %s AND item.status = br.com.ampere.domain.CheckStatus.WARNING)"""
          .formatted(LATEST_CALCULATION);

  private static final String BLOCKING = "br.com.ampere.domain.FindingSeverity.BLOCKING";

  @PersistenceContext private EntityManager entityManager;

  @Override
  public Page<Project> searchAccessibleProjects(ProjectSearch search, Pageable pageable) {
    StringBuilder where = new StringBuilder();
    Map<String, Object> parameters = new HashMap<>();

    if (search.admin()) {
      where.append("WHERE project.submittedAt IS NOT NULL");
    } else {
      where.append("WHERE project.owner.id = :ownerId");
      parameters.put("ownerId", search.ownerId());
    }
    if (search.status() != null) {
      where.append(" AND project.status = :status");
      parameters.put("status", search.status());
    }
    if (!search.search().isEmpty()) {
      where.append(" AND project.searchIndex LIKE CONCAT('%', :search, '%') ESCAPE '\\'");
      parameters.put("search", search.search());
    }
    filterByPlace(search.states(), search.municipalities(), where, parameters);
    if (search.createdFrom() != null) {
      where.append(" AND project.createdAt >= :createdFrom");
      parameters.put("createdFrom", search.createdFrom());
    }
    if (search.createdBefore() != null) {
      where.append(" AND project.createdAt < :createdBefore");
      parameters.put("createdBefore", search.createdBefore());
    }
    if (!search.findings().isEmpty()) {
      where
          .append(" AND (")
          .append(
              search.findings().stream()
                  .sorted()
                  .map(
                      findings ->
                          switch (findings) {
                            case BLOCKING_OPEN ->
                                "EXISTS " + openFindings(" AND finding.severity = " + BLOCKING);
                            case ANY_OPEN -> "EXISTS " + openFindings("");
                            case NONE_OPEN -> "NOT EXISTS " + openFindings("");
                          })
                  .collect(Collectors.joining(" OR ")))
          .append(")");
    }

    String direction = search.direction().name();
    String column =
        switch (search.sort()) {
          case NAME -> "LOWER(project.name) " + direction;
          case DEMAND -> LATEST_DEMAND + " " + direction + " NULLS LAST";
          case CREATED_AT -> "project.createdAt " + direction;
          case UPDATED_AT -> "project.updatedAt " + direction;
        };

    return page(
        "SELECT project FROM Project project",
        where,
        parameters,
        column + ", project.id " + direction,
        pageable);
  }

  @Override
  public Page<Project> searchReviewQueue(ReviewQueueSearch search, Pageable pageable) {
    StringBuilder where =
        new StringBuilder(
            "WHERE project.status = br.com.ampere.domain.ProjectStatus.UNDER_REVIEW"
                + " AND project.submittedAt IS NOT NULL");
    Map<String, Object> parameters = new HashMap<>();

    if (!search.search().isEmpty()) {
      where.append(" AND project.reviewSearchIndex LIKE CONCAT('%', :search, '%') ESCAPE '\\'");
      parameters.put("search", search.search());
    }
    if (search.submittedBefore() != null) {
      where.append(" AND project.submittedAt < :submittedBefore");
      parameters.put("submittedBefore", search.submittedBefore());
    }
    if (search.demandAbove() != null) {
      where.append(" AND ").append(LATEST_DEMAND).append(" > :demandAbove");
      parameters.put("demandAbove", search.demandAbove());
    }
    if (search.reanalysis()) {
      where.append(" AND project.reviewCycle > 1");
    }
    filterByPlace(search.states(), search.municipalities(), where, parameters);
    if (search.unassigned()) {
      where.append(" AND project.reviewer IS NULL");
    } else if (search.reviewerId() != null) {
      where.append(" AND project.reviewer.id = :reviewerId");
      parameters.put("reviewerId", search.reviewerId());
    }

    String direction = search.direction().name();
    String column =
        switch (search.sort()) {
          // The deadline is the submission plus a fixed period, so both give the same order.
          case DEADLINE, SUBMITTED_AT -> "project.submittedAt " + direction;
          case DEMAND -> LATEST_DEMAND + " " + direction;
          case WARNINGS -> LATEST_WARNING_COUNT + " " + direction;
        };

    return page(
        "SELECT project FROM Project project LEFT JOIN FETCH project.owner",
        where,
        parameters,
        column + ", project.id ASC",
        pageable);
  }

  private static String openFindings(String condition) {
    return "(SELECT finding.id FROM Finding finding WHERE finding.project = project"
        + " AND finding.status = br.com.ampere.domain.FindingStatus.OPEN"
        + condition
        + ")";
  }

  private static void filterByPlace(
      Collection<BrazilianState> states,
      Collection<String> municipalities,
      StringBuilder where,
      Map<String, Object> parameters) {
    if (!states.isEmpty()) {
      where.append(" AND project.state IN :states");
      parameters.put("states", states);
    }
    Set<String> folded =
        municipalities.stream()
            .filter(municipality -> !municipality.isBlank())
            .map(municipality -> municipality.trim().toLowerCase(Locale.ROOT))
            .collect(Collectors.toSet());
    if (!folded.isEmpty()) {
      where.append(" AND LOWER(TRIM(project.municipality)) IN :municipalities");
      parameters.put("municipalities", folded);
    }
  }

  private Page<Project> page(
      String select,
      CharSequence where,
      Map<String, Object> parameters,
      String orderBy,
      Pageable pageable) {
    TypedQuery<Long> count =
        entityManager.createQuery(
            "SELECT COUNT(project) FROM Project project " + where, Long.class);
    parameters.forEach(count::setParameter);
    long total = count.getSingleResult();
    if (total == 0) {
      return Page.empty(pageable);
    }

    TypedQuery<Project> query =
        entityManager.createQuery(select + " " + where + " ORDER BY " + orderBy, Project.class);
    parameters.forEach(query::setParameter);
    query.setFirstResult((int) pageable.getOffset());
    query.setMaxResults(pageable.getPageSize());

    return new PageImpl<>(query.getResultList(), pageable, total);
  }
}
