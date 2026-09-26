package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.Optional;

/** The published tables the calculation reads, without the domain knowing how they are stored. */
public interface NormativeTables {

  /** Empty when the table has no row for the argument; an unpublished table still throws. */
  Optional<NormativeValue> lookup(NormativeTableCode code, String key, BigDecimal argument);

  NormativeValue find(NormativeTableCode code, String key, BigDecimal argument);

  default NormativeValue find(NormativeTableCode code, BigDecimal argument) {
    return find(code, null, argument);
  }

  default NormativeValue find(NormativeTableCode code, String key) {
    return find(code, key, null);
  }
}
