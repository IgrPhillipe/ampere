package br.com.ampere.service;

import br.com.ampere.error.BusinessException;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

final class FilterValues {

  private FilterValues() {}

  /** A missing list filters nothing; an empty or blank value is a bad request, not a wildcard. */
  static <T> Set<T> setOf(Collection<T> values, String parameter) {
    if (values == null) {
      return Set.of();
    }
    if (values.stream().anyMatch(value -> value == null || value.toString().isBlank())) {
      throw new BusinessException("O filtro '" + parameter + "' tem um valor vazio.");
    }
    return values.stream()
        .map(value -> value instanceof String text ? castTrimmed(text) : value)
        .collect(Collectors.toUnmodifiableSet());
  }

  @SuppressWarnings("unchecked")
  private static <T> T castTrimmed(String text) {
    return (T) text.trim();
  }
}
