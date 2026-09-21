package br.com.ampere.repository;

import br.com.ampere.domain.Finding;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FindingRepository extends JpaRepository<Finding, Long> {

  @Query(
      """
      SELECT finding.project.id AS projectId, COUNT(finding) AS total
      FROM Finding finding
      WHERE finding.project.id IN :projectIds
      GROUP BY finding.project.id
      """)
  List<FindingCount> countPerProject(@Param("projectIds") Collection<Long> projectIds);

  void deleteAllByProjectId(Long projectId);

  interface FindingCount {

    Long getProjectId();

    long getTotal();
  }
}
