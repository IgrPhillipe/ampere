package br.com.ampere.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Normalizes user-provided terms before they are used in database searches.
 *
 * <p>Two separate jobs, deliberately named apart: {@link #fold} makes the comparison
 * accent-insensitive and case-insensitive, {@link #escapeLike} keeps a typed {@code %} from acting
 * as a wildcard. {@link #normalize} composes both and is what the query path uses; the same {@code
 * fold} also builds the column it compares against, so both sides are folded the same way.
 */
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

  /** Term ready for the {@code LIKE} of the listing query. */
  public static String normalize(String raw) {
    return escapeLike(fold(raw));
  }
}
