package br.com.ampere.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class SearchTerms {

  private static final Pattern DIACRITICS = Pattern.compile("\\p{M}+");

  private SearchTerms() {}

  /** Strips accents and lowercases, so {@code "Edifício"} and {@code "edificio"} match. */
  public static String fold(String raw) {
    if (raw == null || raw.isBlank()) {
      return "";
    }

    String decomposed = Normalizer.normalize(raw.trim(), Normalizer.Form.NFD);

    return DIACRITICS.matcher(decomposed).replaceAll("").toLowerCase(Locale.ROOT);
  }

  /** Escapes the {@code LIKE} metacharacters, matching the {@code ESCAPE '\'} of the query. */
  public static String escapeLike(String raw) {
    if (raw == null || raw.isEmpty()) {
      return "";
    }

    return raw.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
  }

  public static String normalize(String raw) {
    return escapeLike(fold(raw));
  }
}
