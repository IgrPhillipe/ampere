package br.com.ampere.repository;

import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NormativeTableRepository extends JpaRepository<NormativeTable, Long> {

  /**
   * Partial unique index on the code of the drafts, created by {@code NormativeTableDraftIndex}.
   */
  String ONE_DRAFT_PER_CODE = "normative_table_one_draft_per_code";

  @EntityGraph(attributePaths = {"standard", "rows"})
  List<NormativeTable> findAllByStatus(NormativeTableStatus status);

  @EntityGraph(attributePaths = {"standard", "rows"})
  List<NormativeTable> findListingBy();

  @EntityGraph(attributePaths = {"standard", "rows"})
  Optional<NormativeTable> findDetailById(Long id);

  @EntityGraph(attributePaths = {"standard", "rows"})
  List<NormativeTable> findAllByCode(NormativeTableCode code);

  Optional<NormativeTable> findByCodeAndStatus(
      NormativeTableCode code, NormativeTableStatus status);

  boolean existsByCodeAndStatus(NormativeTableCode code, NormativeTableStatus status);
}
