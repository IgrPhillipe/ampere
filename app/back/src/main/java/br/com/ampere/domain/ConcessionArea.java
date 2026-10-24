package br.com.ampere.domain;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/** Neoenergia Pernambuco serves every municipality of Pernambuco and Pedras de Fogo, in Paraíba. */
public final class ConcessionArea {

  public static final String OUTSIDE_MESSAGE =
      "Fora da área atendida pela Neoenergia Pernambuco: Pernambuco ou Pedras de Fogo (PB).";

  public static final String POSTAL_CODE_MESSAGE = "O CEP não pertence à UF informada.";

  // Correios ranges: Pernambuco is 50000-000 to 56999-999; Pedras de Fogo is 58328-xxx.
  private static final Map<BrazilianState, long[]> POSTAL_CODE_RANGES =
      Map.of(
          BrazilianState.PE, new long[] {50_000_000L, 56_999_999L},
          BrazilianState.PB, new long[] {58_328_000L, 58_328_999L});

  private ConcessionArea() {}

  /** The municipality with the IBGE spelling, or empty when the place is outside the area. */
  public static Optional<String> municipalityOf(BrazilianState state, String municipality) {
    if (state == null || municipality == null) {
      return Optional.empty();
    }
    String folded = fold(municipality);
    return ConcessionMunicipalities.BY_STATE.getOrDefault(state, List.of()).stream()
        .filter(name -> fold(name).equals(folded))
        .findFirst();
  }

  public static boolean coversPostalCode(BrazilianState state, String postalCode) {
    long[] range = state == null ? null : POSTAL_CODE_RANGES.get(state);
    if (range == null || postalCode == null || !postalCode.matches("\\d{8}")) {
      return false;
    }
    long value = Long.parseLong(postalCode);
    return value >= range[0] && value <= range[1];
  }

  private static String fold(String value) {
    return Normalizer.normalize(value.trim(), Normalizer.Form.NFD)
        .replaceAll("\\p{M}", "")
        .toLowerCase(Locale.ROOT);
  }
}
