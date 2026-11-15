package br.com.ampere.service;

import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableComparison;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.NormativeTableRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Every revision ever registered for a table code, superseded and drafts included, newest first.
 */
@Service
public class NormativeTableHistoryService {

  /** In the order the revisions took effect: published by approval date, drafts after them. */
  private static final Comparator<NormativeTable> OLDEST_FIRST =
      Comparator.comparing(
              NormativeTable::getVerifiedAt, Comparator.nullsLast(Comparator.naturalOrder()))
          .thenComparing(NormativeTable::getRegisteredAt)
          .thenComparing(NormativeTable::getId);

  private final NormativeTableService tableService;
  private final NormativeTableRepository tableRepository;

  public NormativeTableHistoryService(
      NormativeTableService tableService, NormativeTableRepository tableRepository) {
    this.tableService = tableService;
    this.tableRepository = tableRepository;
  }

  @Transactional(readOnly = true)
  public List<NormativeTable> revisions(Long id, AuthenticatedUser user) {
    NormativeTable table = tableService.findById(id, user);

    return tableRepository.findAllByCode(table.getCode()).stream()
        .sorted(OLDEST_FIRST.reversed())
        .toList();
  }

  /** Both revisions must belong to the history of {@code id}, the earlier one first. */
  @Transactional(readOnly = true)
  public NormativeTableComparison compare(Long id, Long from, Long to, AuthenticatedUser user) {
    List<NormativeTable> revisions = revisions(id, user);
    NormativeTable older = find(revisions, from);
    NormativeTable newer = find(revisions, to);
    if (OLDEST_FIRST.compare(older, newer) > 0) {
      throw new BusinessException("A revisão de origem não pode ser posterior à de destino.");
    }

    return NormativeTableComparison.between(older, newer);
  }

  private static NormativeTable find(List<NormativeTable> revisions, Long id) {
    return revisions.stream()
        .filter(revision -> revision.getId().equals(id))
        .findFirst()
        .orElseThrow(
            () -> new NotFoundException("Revisão não encontrada no histórico desta tabela."));
  }
}
