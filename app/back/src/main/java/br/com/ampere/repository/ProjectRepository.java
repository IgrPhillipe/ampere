package br.com.ampere.repository;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Database access for electrical projects. */
public interface ProjectRepository extends JpaRepository<Project, Long> {

  @Query(
      """
      SELECT project
      FROM Project project
      WHERE (:status IS NULL OR project.status = :status)
        AND (
          :search = ''
          OR LOWER(project.name) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\'
          OR LOWER(project.protocol) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\'
        )
      """)
  Page<Project> findAllByFilters(
      @Param("status") ProjectStatus status, @Param("search") String search, Pageable pageable);

  @Query(
      """
      SELECT project.status AS status, COUNT(project) AS total
      FROM Project project
      GROUP BY project.status
      """)
  List<ProjectStatusCount> countByStatus();

  interface ProjectStatusCount {

    ProjectStatus getStatus();

    long getTotal();
  }
}
