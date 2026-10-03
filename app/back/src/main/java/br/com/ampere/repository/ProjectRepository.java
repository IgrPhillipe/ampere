package br.com.ampere.repository;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {

  @Query(
      """
      SELECT project
      FROM Project project
      WHERE (:status IS NULL OR project.status = :status)
        AND (
          :search = ''
          OR project.searchIndex LIKE CONCAT('%', :search, '%') ESCAPE '\\'
        )
      """)
  Page<Project> searchProjects(
      @Param("status") ProjectStatus status, @Param("search") String search, Pageable pageable);

  @Query(
      """
      SELECT project
      FROM Project project
      WHERE project.status = :status
        AND project.submittedAt IS NOT NULL
      ORDER BY project.submittedAt ASC, project.id ASC
      """)
  Page<Project> findReviewQueue(@Param("status") ProjectStatus status, Pageable pageable);

  @Query(
      """
      SELECT project
      FROM Project project
      WHERE project.status = :status
        AND project.submittedAt IS NOT NULL
        AND project.submittedAt < :submittedBefore
      ORDER BY project.submittedAt ASC, project.id ASC
      """)
  Page<Project> findReviewQueueSubmittedBefore(
      @Param("status") ProjectStatus status,
      @Param("submittedBefore") OffsetDateTime submittedBefore,
      Pageable pageable);

  long countByStatusAndSubmittedAtIsNotNull(ProjectStatus status);

  long countByStatusAndSubmittedAtBefore(ProjectStatus status, OffsetDateTime submittedBefore);

  long countByReviewedAtGreaterThanEqual(OffsetDateTime since);

  long countByStatusAndReviewedAtGreaterThanEqual(ProjectStatus status, OffsetDateTime since);

  @Query(
      """
      SELECT project.status AS status, COUNT(project) AS total
      FROM Project project
      GROUP BY project.status
      """)
  List<ProjectStatusCount> countPerStatus();

  @Query(
      """
      SELECT MAX(project.protocol)
      FROM Project project
      WHERE project.protocol LIKE CONCAT(:year, '-%')
      """)
  Optional<String> findHighestProtocolOfYear(@Param("year") String year);

  @EntityGraph(attributePaths = {"buildingType", "standards"})
  Optional<Project> findDetailById(Long id);

  Optional<Project> findByProtocol(String protocol);

  interface ProjectStatusCount {

    ProjectStatus getStatus();

    long getTotal();
  }
}
