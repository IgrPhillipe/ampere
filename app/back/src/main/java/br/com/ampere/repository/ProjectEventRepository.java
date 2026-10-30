package br.com.ampere.repository;

import br.com.ampere.domain.ProjectEvent;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectEventRepository extends JpaRepository<ProjectEvent, Long> {

  @EntityGraph(attributePaths = "author")
  List<ProjectEvent> findAllByProjectIdOrderByOccurredAtAscIdAsc(Long projectId);

  @EntityGraph(attributePaths = "author")
  List<ProjectEvent> findAllByProjectIdOrderByOccurredAtDescIdDesc(Long projectId);
}
