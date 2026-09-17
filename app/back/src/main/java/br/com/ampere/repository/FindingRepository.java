package br.com.ampere.repository;

import br.com.ampere.domain.Finding;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Database access for project findings. */
public interface FindingRepository extends JpaRepository<Finding, Long> {

  long countByProjectId(Long projectId);

  @Query(
      """
      SELECT finding.project.id AS projectId, COUNT(finding) AS total
      FROM Finding finding
      WHERE finding.project.id IN :projectIds
      GROUP BY finding.project.id
      """)
  List<FindingCount> countByProjectIds(@Param("projectIds") Collection<Long> projectIds);

  interface FindingCount {

    Long getProjectId();

    long getTotal();
  }
}
