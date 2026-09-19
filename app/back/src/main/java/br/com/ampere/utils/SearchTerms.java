package br.com.ampere.utils;

/** Normalizes user-provided terms before they are used in database searches. */
public final class SearchTerms {

  private SearchTerms() {}

  public static String normalize(String raw) {
    if (raw == null || raw.isBlank()) {
      return "";
    }

    return raw.trim().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
  }
}
