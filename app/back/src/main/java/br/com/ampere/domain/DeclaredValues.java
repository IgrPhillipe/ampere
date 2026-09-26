package br.com.ampere.domain;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

final class DeclaredValues {

  private static final Locale BRAZIL = Locale.forLanguageTag("pt-BR");

  private DeclaredValues() {}

  static String decimal(BigDecimal value) {
    NumberFormat format = NumberFormat.getNumberInstance(BRAZIL);
    format.setMinimumFractionDigits(0);
    format.setMaximumFractionDigits(2);
    return format.format(value);
  }

  static boolean isPositive(BigDecimal value) {
    return value != null && value.signum() > 0;
  }
}
