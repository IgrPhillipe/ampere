package br.com.ampere.repository;

import br.com.ampere.domain.ConsumerUnitGroup;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConsumerUnitGroupRepository extends JpaRepository<ConsumerUnitGroup, Long> {

  List<ConsumerUnitGroup> findAllByProjectIdOrderById(Long projectId);

  Optional<ConsumerUnitGroup> findByIdAndProjectId(Long id, Long projectId);

  void deleteAllByProjectId(Long projectId);

  @Query(
      """
      SELECT consumerUnitGroup.project.id AS projectId, SUM(consumerUnitGroup.quantity) AS total
      FROM ConsumerUnitGroup consumerUnitGroup
      WHERE consumerUnitGroup.project.id IN :projectIds
      GROUP BY consumerUnitGroup.project.id
      """)
  List<UnitCount> countUnitsPerProject(@Param("projectIds") Collection<Long> projectIds);

  /** The seed once left the start of the common area elevator unanswered, which blocks a resend. */
  @Modifying
  @Query(
      value =
          """
          UPDATE load_group_item SET simultaneous_start = false
          WHERE simultaneous_start IS NULL
            AND category = 'MOTORS'
            AND description = 'Elevador'
            AND group_id IN (
              SELECT id FROM consumer_unit_group
              WHERE project_id = :projectId AND name = 'Área comum')
          """,
      nativeQuery = true)
  int answerTheCommonAreaElevator(@Param("projectId") Long projectId);

  interface UnitCount {

    Long getProjectId();

    long getTotal();
  }
}
