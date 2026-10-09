package br.com.ampere.repository;

import br.com.ampere.domain.Calculation;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CalculationRepository extends JpaRepository<Calculation, Long> {

  Optional<Calculation> findFirstByProjectIdOrderByIdDesc(Long projectId);

  void deleteAllByProjectId(Long projectId);

  @Query(
      """
      SELECT calculation.project.id AS projectId, calculation.finalTotalDemand AS demand
      FROM Calculation calculation
      WHERE calculation.id IN (
        SELECT MAX(latest.id)
        FROM Calculation latest
        WHERE latest.project.id IN :projectIds
        GROUP BY latest.project.id
      )
      """)
  List<LatestDemand> findLatestDemandPerProject(@Param("projectIds") Collection<Long> projectIds);

  @Query(
      """
      SELECT calculation.project.id AS projectId, COUNT(item) AS warnings
      FROM Calculation calculation
      JOIN calculation.checks item
      WHERE item.status = br.com.ampere.domain.CheckStatus.WARNING
        AND calculation.id IN (
          SELECT MAX(latest.id)
          FROM Calculation latest
          WHERE latest.project.id IN :projectIds
          GROUP BY latest.project.id
        )
      GROUP BY calculation.project.id
      """)
  List<LatestWarnings> countLatestWarningsPerProject(
      @Param("projectIds") Collection<Long> projectIds);

  interface LatestWarnings {

    Long getProjectId();

    Long getWarnings();
  }

  interface LatestDemand {

    Long getProjectId();

    BigDecimal getDemand();
  }
}
