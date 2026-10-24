package br.com.ampere.domain;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Neoenergia Pernambuco serves every municipality of Pernambuco and Pedras de Fogo, in Paraíba. */
public final class ConcessionArea {

  public static final String OUTSIDE_MESSAGE =
      "O projeto precisa ficar na área atendida pela Neoenergia Pernambuco:"
          + " Pernambuco ou Pedras de Fogo (PB).";

  private static final Map<BrazilianState, Set<String>> LIMITED_STATES =
      Map.of(BrazilianState.PB, Set.of("pedras de fogo"));

  private ConcessionArea() {}

  public static boolean covers(BrazilianState state, String municipality) {
    if (state == BrazilianState.PE) {
      return true;
    }
    Set<String> municipalities = state == null ? null : LIMITED_STATES.get(state);
    return municipalities != null
        && municipality != null
        && municipalities.contains(fold(municipality));
  }

  private static String fold(String value) {
    return Normalizer.normalize(value.trim(), Normalizer.Form.NFD)
        .replaceAll("\\p{M}", "")
        .toLowerCase(Locale.ROOT);
  }
}
