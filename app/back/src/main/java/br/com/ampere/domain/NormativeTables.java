package br.com.ampere.domain;

import java.math.BigDecimal;

/** The published tables the calculation reads, without the domain knowing how they are stored. */
public interface NormativeTables {

  NormativeValue find(NormativeTableCode code, String key, BigDecimal argument);

  default NormativeValue find(NormativeTableCode code, BigDecimal argument) {
    return find(code, null, argument);
  }

  default NormativeValue find(NormativeTableCode code, String key) {
    return find(code, key, null);
  }
}
