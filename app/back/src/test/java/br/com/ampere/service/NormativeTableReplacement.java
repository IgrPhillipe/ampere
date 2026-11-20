package br.com.ampere.service;

import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableRow;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.repository.NormativeTableRepository;
import java.math.BigDecimal;

/** Publishes a revision with the values scaled by a factor, superseding the current one. */
final class NormativeTableReplacement {

  private NormativeTableReplacement() {}

  static NormativeTable published(NormativeTableRepository repository, NormativeTableCode code) {
    return repository.findByCodeAndStatus(code, NormativeTableStatus.PUBLISHED).orElseThrow();
  }

  static NormativeTable replace(
      NormativeTableRepository repository, NormativeTableCode code, String factor) {
    NormativeTable old = published(repository, code);
    NormativeTable replacement =
        new NormativeTable(
            old.getStandard(),
            old.getCode(),
            old.getIdentification(),
            old.getItem(),
            old.getPage(),
            old.getRows().stream()
                .map(
                    row ->
                        new NormativeTableRow(
                            row.getRowKey(),
                            row.getLowerBound(),
                            row.getUpperBound(),
                            row.getPrimaryValue().multiply(new BigDecimal(factor)),
                            row.getSecondaryValue(),
                            row.getTertiaryValue(),
                            row.getLabel()))
                .toList(),
            "author");
    replacement.publish("verifier");
    old.supersede(replacement.getVerifiedAt());
    repository.save(old);
    return repository.saveAndFlush(replacement);
  }
}
