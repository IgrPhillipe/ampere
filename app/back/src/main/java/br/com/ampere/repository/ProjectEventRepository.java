package br.com.ampere.repository;

import br.com.ampere.domain.ProjectEvent;
import java.time.OffsetDateTime;
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
}
