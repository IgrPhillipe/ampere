package br.com.ampere.repository;

import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NormativeTableRepository extends JpaRepository<NormativeTable, Long> {

  @EntityGraph(attributePaths = {"standard", "rows"})
  List<NormativeTable> findAllByStatus(NormativeTableStatus status);

  @EntityGraph(attributePaths = {"standard", "rows"})
  List<NormativeTable> findAllByOrderByCodeAscIdDesc();

  @EntityGraph(attributePaths = {"standard", "rows"})
  Optional<NormativeTable> findDetailById(Long id);

  Optional<NormativeTable> findByCodeAndStatus(
      NormativeTableCode code, NormativeTableStatus status);
}
