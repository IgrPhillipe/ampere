package br.com.ampere.repository;

import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.FindingStatus;
import br.com.ampere.domain.ProjectStatus;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FindingRepository extends JpaRepository<Finding, Long> {

  @Query(
      """
      SELECT finding.project.id AS projectId, COUNT(finding) AS total
      FROM Finding finding
      WHERE finding.project.id IN :projectIds
        AND finding.status IN :statuses
        AND finding.project.status <> :closed
      GROUP BY finding.project.id
      """)
  List<FindingCount> countPerProject(
      @Param("projectIds") Collection<Long> projectIds,
      @Param("statuses") Collection<FindingStatus> statuses,
      @Param("closed") ProjectStatus closed);

  @Query(
      """
      SELECT finding.project.id AS projectId, COUNT(finding) AS total
      FROM Finding finding
      WHERE finding.project.id IN :projectIds
        AND finding.severity = :severity
        AND finding.status = :status
      GROUP BY finding.project.id
      """)
  List<FindingCount> countPerProjectBySeverityAndStatus(
      @Param("projectIds") Collection<Long> projectIds,
      @Param("severity") FindingSeverity severity,
      @Param("status") FindingStatus status);

  /** Published findings an owner's projects received since the instant, most frequent first. */
  @Query(
      """
      SELECT finding.stage AS stage, finding.standardItem AS standardItem, COUNT(finding) AS total
      FROM Finding finding
      WHERE finding.project.owner.id = :ownerId
        AND finding.createdAt >= :since
        AND finding.status <> br.com.ampere.domain.FindingStatus.DRAFT
      GROUP BY finding.stage, finding.standardItem
      ORDER BY COUNT(finding) DESC, finding.stage, finding.standardItem
      """)
  List<FindingRank> rankByOwner(
      @Param("ownerId") Long ownerId, @Param("since") OffsetDateTime since, Pageable pageable);

  void deleteAllByProjectId(Long projectId);

  @EntityGraph(attributePaths = {"author", "consumerUnitGroup"})
  List<Finding> findAllByProjectIdOrderByCreatedAtAscIdAsc(Long projectId);

  List<Finding> findAllByConsumerUnitGroupId(Long groupId);

  @EntityGraph(attributePaths = {"author", "consumerUnitGroup"})
  Optional<Finding> findByIdAndProjectId(Long id, Long projectId);

  long countByProjectIdAndSeverityAndStatus(
      Long projectId, FindingSeverity severity, FindingStatus status);

  long countByProjectIdAndStatusIn(Long projectId, Collection<FindingStatus> statuses);

  interface FindingCount {

    Long getProjectId();

    long getTotal();
  }

  interface FindingRank {

    FindingStage getStage();

    String getStandardItem();

    long getTotal();
  }
}
