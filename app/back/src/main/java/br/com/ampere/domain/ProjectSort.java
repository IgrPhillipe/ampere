package br.com.ampere.domain;

import br.com.ampere.error.BusinessException;
import java.util.Locale;

public enum ProjectSort {
  NAME,
  DEMAND,
  CREATED_AT,
  UPDATED_AT;

  public static ProjectSort from(String value) {
    if (value == null || value.isBlank()) {
      return UPDATED_AT;
    }
    String normalized = value.trim().toLowerCase(Locale.ROOT);
    return switch (normalized) {
      case "name" -> NAME;
      case "demand" -> DEMAND;
      case "createdat", "created_at" -> CREATED_AT;
      case "updatedat", "updated_at" -> UPDATED_AT;
      default ->
          throw new BusinessException(
              "Valor inválido para ordenação. Valores aceitos: name, demand, createdAt, updatedAt.");
    };
  }
}
