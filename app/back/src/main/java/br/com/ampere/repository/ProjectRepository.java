package br.com.ampere.repository;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ProjectVisibility;
import br.com.ampere.domain.User;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long>, ProjectRepositoryCustom {

  @Query(
      """
      SELECT DISTINCT project.municipality
      FROM Project project
      WHERE (
          :everyProject = true
          OR (:submittedOnly = true AND project.submittedAt IS NOT NULL)
          OR (:everyProject = false AND :submittedOnly = false AND project.owner.id = :ownerId)
        )
      ORDER BY project.municipality ASC
      """)
  List<String> findAccessibleMunicipalities(
      @Param("ownerId") Long ownerId,
      @Param("everyProject") boolean everyProject,
      @Param("submittedOnly") boolean submittedOnly);

  default List<String> findAccessibleMunicipalities(Long ownerId, ProjectVisibility visibility) {
    return findAccessibleMunicipalities(
        ownerId, visibility == ProjectVisibility.ALL, visibility == ProjectVisibility.SUBMITTED);
  }

  @Query(
      """
      SELECT DISTINCT owner
      FROM Project project
      JOIN project.owner owner
      WHERE (
          :everyProject = true
          OR (:submittedOnly = true AND project.submittedAt IS NOT NULL)
          OR (:everyProject = false AND :submittedOnly = false AND owner.id = :ownerId)
        )
      ORDER BY owner.name ASC
      """)
  List<User> findAccessibleOwners(
      @Param("ownerId") Long ownerId,
      @Param("everyProject") boolean everyProject,
      @Param("submittedOnly") boolean submittedOnly);

  default List<User> findAccessibleOwners(Long ownerId, ProjectVisibility visibility) {
    return findAccessibleOwners(
        ownerId, visibility == ProjectVisibility.ALL, visibility == ProjectVisibility.SUBMITTED);
  }

  long countByStatusAndSubmittedAtIsNotNull(ProjectStatus status);

  long countByReviewedAtGreaterThanEqual(OffsetDateTime since);

  long countByStatusAndReviewedAtGreaterThanEqual(ProjectStatus status, OffsetDateTime since);

  @Query(
      """
      SELECT project.status AS status, COUNT(project) AS total
      FROM Project project
      WHERE (
        :everyProject = true
        OR (:submittedOnly = true AND project.submittedAt IS NOT NULL)
        OR (:everyProject = false AND :submittedOnly = false AND project.owner.id = :ownerId)
      )
      GROUP BY project.status
      """)
  List<ProjectStatusCount> countAccessiblePerStatus(
      @Param("ownerId") Long ownerId,
      @Param("everyProject") boolean everyProject,
      @Param("submittedOnly") boolean submittedOnly);

  default List<ProjectStatusCount> countAccessiblePerStatus(
      Long ownerId, ProjectVisibility visibility) {
    return countAccessiblePerStatus(
        ownerId, visibility == ProjectVisibility.ALL, visibility == ProjectVisibility.SUBMITTED);
  }

  @Query(
      """
      SELECT MAX(project.protocol)
      FROM Project project
      WHERE project.protocol LIKE CONCAT(:year, '-%')
      """)
  Optional<String> findHighestProtocolOfYear(@Param("year") String year);

  @EntityGraph(attributePaths = {"buildingType", "standards", "owner", "reviewer"})
  Optional<Project> findDetailById(Long id);

  Optional<Project> findByProtocol(String protocol);

  List<Project> findAllByOwnerIsNull();

  @Modifying
  @Query(
      """
      UPDATE Project project
      SET project.reviewCycle = 1
      WHERE project.reviewCycle = 0
        AND project.status NOT IN (
          br.com.ampere.domain.ProjectStatus.DRAFT,
          br.com.ampere.domain.ProjectStatus.AWAITING_SUBMISSION)
      """)
  int startReviewCycleOfLegacySubmissions();

  interface ProjectStatusCount {

    ProjectStatus getStatus();

    long getTotal();
  }
}
