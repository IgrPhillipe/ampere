package br.com.ampere.repository;

import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectEventRepository extends JpaRepository<ProjectEvent, Long> {

  /** Null when the project has no events. */
  @Query("SELECT MAX(event.occurredAt) FROM ProjectEvent event WHERE event.project.id = :projectId")
  OffsetDateTime findLastOccurredAt(@Param("projectId") Long projectId);

  @EntityGraph(attributePaths = "author")
  List<ProjectEvent> findAllByProjectIdOrderByOccurredAtAscIdAsc(Long projectId);

  @EntityGraph(attributePaths = "author")
  List<ProjectEvent> findAllByProjectIdOrderByOccurredAtDescIdDesc(Long projectId);

  boolean existsByProjectId(Long projectId);

  @Query(
      """
      SELECT COUNT(DISTINCT event.project.id)
      FROM ProjectEvent event
      WHERE event.project.owner.id = :ownerId
        AND event.type = br.com.ampere.domain.ProjectEventType.SUBMITTED
        AND event.occurredAt >= :since
      """)
  long countSubmittedProjects(@Param("ownerId") Long ownerId, @Param("since") OffsetDateTime since);

  /** Each project's first decision, counted per outcome when it happened since the instant. */
  @Query(
      """
      SELECT decision.type AS type, COUNT(decision) AS total
      FROM ProjectEvent decision
      WHERE decision.project.owner.id = :ownerId
        AND decision.type IN :decisions
        AND decision.occurredAt >= :since
        AND NOT EXISTS (
          SELECT 1
          FROM ProjectEvent earlier
          WHERE earlier.project = decision.project
            AND earlier.type IN :decisions
            AND (earlier.occurredAt < decision.occurredAt
              OR (earlier.occurredAt = decision.occurredAt AND earlier.id < decision.id))
        )
      GROUP BY decision.type
      """)
  List<DecisionCount> countFirstDecisions(
      @Param("ownerId") Long ownerId,
      @Param("since") OffsetDateTime since,
      @Param("decisions") Collection<ProjectEventType> decisions);

  @Query(
      """
      SELECT approval.project.id AS projectId,
        approval.occurredAt AS approvedAt,
        (SELECT MIN(submission.occurredAt)
          FROM ProjectEvent submission
          WHERE submission.project = approval.project
            AND submission.type = br.com.ampere.domain.ProjectEventType.SUBMITTED)
          AS firstSubmittedAt
      FROM ProjectEvent approval
      WHERE approval.project.owner.id = :ownerId
        AND approval.type = br.com.ampere.domain.ProjectEventType.APPROVED
        AND approval.occurredAt >= :since
      """)
  List<Approval> findApprovals(
      @Param("ownerId") Long ownerId, @Param("since") OffsetDateTime since);

  /**
   * The whole history of the given types for the projects in scope with one of them since the
   * instant. A null reviewer means every project.
   */
  @Query(
      """
      SELECT event.project.id AS projectId, event.type AS type, event.version AS version,
        event.occurredAt AS occurredAt
      FROM ProjectEvent event
      WHERE event.type IN :types
        AND event.project.id IN (
          SELECT project.id
          FROM ProjectEvent recent
          JOIN recent.project project
          LEFT JOIN project.reviewer reviewer
          WHERE recent.type IN :types
            AND recent.occurredAt >= :since
            AND (:reviewerId IS NULL OR reviewer.id = :reviewerId)
        )
      ORDER BY event.occurredAt, event.id
      """)
  List<ReviewEvent> findReviewHistory(
      @Param("reviewerId") Long reviewerId,
      @Param("since") OffsetDateTime since,
      @Param("types") Collection<ProjectEventType> types);

  interface DecisionCount {

    ProjectEventType getType();

    long getTotal();
  }

  interface Approval {

    Long getProjectId();

    OffsetDateTime getApprovedAt();

    /** Null for a project approved before the history recorded submissions. */
    OffsetDateTime getFirstSubmittedAt();
  }

  interface ReviewEvent {

    Long getProjectId();

    ProjectEventType getType();

    int getVersion();

    OffsetDateTime getOccurredAt();
  }
}
