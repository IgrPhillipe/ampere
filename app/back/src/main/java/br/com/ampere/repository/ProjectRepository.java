package br.com.ampere.repository;

import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
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
          OR LOWER(project.name) LIKE LOWER(CONCAT('%', :search, '%'))
          OR LOWER(project.protocol) LIKE LOWER(CONCAT('%', :search, '%'))
        )
      """)
  Page<Project> findAllByFilters(
      @Param("status") ProjectStatus status, @Param("search") String search, Pageable pageable);
}
