package br.com.ampere.domain;

import br.com.ampere.error.BusinessException;
import java.util.Locale;

public enum ReviewQueueSort {
  DEADLINE,
  SUBMITTED_AT,
  DEMAND,
  WARNINGS;

  public static ReviewQueueSort from(String value) {
    if (value == null || value.isBlank()) {
      return DEADLINE;
    }
    String normalized = value.trim().toLowerCase(Locale.ROOT);
    return switch (normalized) {
      case "deadline" -> DEADLINE;
      case "submittedat", "submitted_at" -> SUBMITTED_AT;
      case "demand" -> DEMAND;
      case "warnings" -> WARNINGS;
      default ->
          throw new BusinessException(
              "Valor inválido para ordenação. Valores aceitos: deadline, submittedAt, demand, warnings.");
    };
  }
}
