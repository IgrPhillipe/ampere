package br.com.ampere.repository;

import br.com.ampere.domain.ConsumerUnitGroup;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsumerUnitGroupRepository extends JpaRepository<ConsumerUnitGroup, Long> {

  List<ConsumerUnitGroup> findAllByProjectIdOrderById(Long projectId);

  Optional<ConsumerUnitGroup> findByIdAndProjectId(Long id, Long projectId);

  void deleteAllByProjectId(Long projectId);
}
