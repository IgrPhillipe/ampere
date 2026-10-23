package br.com.ampere.repository;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectSort;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ReviewQueueSort;
import br.com.ampere.domain.SortDirection;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public class ProjectRepositoryImpl implements ProjectRepositoryCustom {

  /** Demand of the latest calculation; a project without one sorts last in both directions. */
  private static final String LATEST_DEMAND =
      """
      (
        SELECT c.finalTotalDemand
        FROM Calculation c
        WHERE c.project = project
          AND c.id = (SELECT MAX(latest.id) FROM Calculation latest WHERE latest.project = project)
      )""";

  @PersistenceContext private EntityManager entityManager;

  @Override
  public Page<Project> searchAccessibleProjects(
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
      Pageable pageable) {

    StringBuilder where = new StringBuilder();
    Map<String, Object> parameters = new HashMap<>();

    where.append("WHERE (");
    if (admin) {
      where.append("project.submittedAt IS NOT NULL");
    } else {
      where.append("project.owner.id = :ownerId");
      parameters.put("ownerId", ownerId);
    }
    where.append(")");

    if (status != null) {
      where.append(" AND project.status = :status");
      parameters.put("status", status);
    }

    if (search != null && !search.isBlank()) {
      where.append(" AND project.searchIndex LIKE CONCAT('%', :search, '%') ESCAPE '\\'");
      parameters.put("search", search);
    }

    if (municipality != null && !municipality.isBlank()) {
      where.append(" AND LOWER(project.municipality) = LOWER(:municipality)");
      parameters.put("municipality", municipality.trim());
    }

    if (createdFrom != null) {
      where.append(" AND project.createdAt >= :createdFrom");
      parameters.put("createdFrom", createdFrom);
    }

    if (createdTo != null) {
      where.append(" AND project.createdAt < :createdTo");
      parameters.put("createdTo", createdTo);
    }

    if (hasBlocking) {
      where.append(
          """
           AND EXISTS (
            SELECT finding.id
            FROM Finding finding
            WHERE finding.project = project
              AND finding.severity = br.com.ampere.domain.FindingSeverity.BLOCKING
              AND finding.status = br.com.ampere.domain.FindingStatus.OPEN
          )""");
    }

    String countJpql = "SELECT COUNT(project) FROM Project project " + where;
    TypedQuery<Long> countQuery = entityManager.createQuery(countJpql, Long.class);
    parameters.forEach(countQuery::setParameter);
    long total = countQuery.getSingleResult();

    if (total == 0) {
      return new PageImpl<>(List.of(), pageable, 0);
    }

    String dir = direction == null ? "DESC" : direction.name();
    ProjectSort projectSort = sort == null ? ProjectSort.UPDATED_AT : sort;

    String orderBy =
        switch (projectSort) {
          case NAME -> "ORDER BY LOWER(project.name) " + dir + ", project.id " + dir;
          case CREATED_AT -> "ORDER BY project.createdAt " + dir + ", project.id " + dir;
          case UPDATED_AT -> "ORDER BY project.updatedAt " + dir + ", project.id " + dir;
          case DEMAND ->
              "ORDER BY CASE WHEN "
                  + LATEST_DEMAND
                  + " IS NULL THEN 1 ELSE 0 END ASC, "
                  + LATEST_DEMAND
                  + " "
                  + dir
                  + ", project.id "
                  + dir;
        };

    String selectJpql = "SELECT project FROM Project project " + where + " " + orderBy;
    TypedQuery<Project> query = entityManager.createQuery(selectJpql, Project.class);
    parameters.forEach(query::setParameter);

    query.setFirstResult((int) pageable.getOffset());
    query.setMaxResults(pageable.getPageSize());

    return new PageImpl<>(query.getResultList(), pageable, total);
  }

  @Override
  public Page<Project> searchReviewQueue(
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
      Pageable pageable) {

    StringBuilder where = new StringBuilder();
    Map<String, Object> parameters = new HashMap<>();

    where.append("WHERE project.status = :status AND project.submittedAt IS NOT NULL");
    parameters.put("status", status);

    if (search != null && !search.isBlank()) {
      where.append(" AND project.reviewSearchIndex LIKE CONCAT('%', :search, '%') ESCAPE '\\'");
      parameters.put("search", search);
    }

    if (dueSoon) {
      where.append(" AND project.submittedAt < :submittedBefore");
      parameters.put("submittedBefore", submittedBefore);
    }

    if (reanalysis) {
      where.append(" AND project.reviewCycle > 1");
    }

    if (highDemand) {
      where.append(
          """
           AND EXISTS (
            SELECT calculation.id
            FROM Calculation calculation
            WHERE calculation.project = project
              AND calculation.id = (
                SELECT MAX(latest.id)
                FROM Calculation latest
                WHERE latest.project = project
              )
              AND calculation.finalTotalDemand > :minimumDemand
          )""");
      parameters.put("minimumDemand", minimumDemand);
    }

    if (municipality != null && !municipality.isBlank()) {
      where.append(" AND LOWER(project.municipality) = LOWER(:municipality)");
      parameters.put("municipality", municipality.trim());
    }

    if (reviewer != null && !reviewer.isBlank()) {
      if ("none".equalsIgnoreCase(reviewer.trim())) {
        where.append(" AND project.reviewer IS NULL");
      } else {
        where.append(" AND project.reviewer.id = :reviewerId");
        parameters.put("reviewerId", Long.valueOf(reviewer.trim()));
      }
    }

    String countJpql = "SELECT COUNT(project) FROM Project project " + where;
    TypedQuery<Long> countQuery = entityManager.createQuery(countJpql, Long.class);
    parameters.forEach(countQuery::setParameter);
    long total = countQuery.getSingleResult();

    if (total == 0) {
      return new PageImpl<>(List.of(), pageable, 0);
    }

    String dir = direction == null ? "ASC" : direction.name();
    ReviewQueueSort queueSort = sort == null ? ReviewQueueSort.DEADLINE : sort;

    String orderBy =
        switch (queueSort) {
          case DEADLINE, SUBMITTED_AT -> "ORDER BY project.submittedAt " + dir + ", project.id ASC";
          case DEMAND ->
              "ORDER BY CASE WHEN "
                  + LATEST_DEMAND
                  + " IS NULL THEN 1 ELSE 0 END ASC, "
                  + LATEST_DEMAND
                  + " "
                  + dir
                  + ", project.id ASC";
          case WARNINGS ->
              """
              ORDER BY (
                SELECT COUNT(item)
                FROM Calculation c
                JOIN c.checks item
                WHERE c.project = project
                  AND c.id = (SELECT MAX(latest.id) FROM Calculation latest WHERE latest.project = project)
                  AND item.status = br.com.ampere.domain.CheckStatus.WARNING
              ) """
                  + dir
                  + ", project.id ASC";
        };

    String selectJpql =
        "SELECT project FROM Project project LEFT JOIN FETCH project.owner "
            + where
            + " "
            + orderBy;
    TypedQuery<Project> query = entityManager.createQuery(selectJpql, Project.class);
    parameters.forEach(query::setParameter);

    query.setFirstResult((int) pageable.getOffset());
    query.setMaxResults(pageable.getPageSize());

    return new PageImpl<>(query.getResultList(), pageable, total);
  }
}
