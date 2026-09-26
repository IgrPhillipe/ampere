package br.com.ampere.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.Locale;

final class DeclaredValues {

  private static final Locale BRAZIL = Locale.forLanguageTag("pt-BR");

  private DeclaredValues() {}

  static String decimal(BigDecimal value) {
    return format(value, 0, 2);
  }

  /** Always {@code digits} places, as a calculation line prints them: 1,50 and 0,7129. */
  static String fixed(BigDecimal value, int digits) {
    return format(value, digits, digits);
  }

  static BigDecimal kva(BigDecimal value) {
    return value.setScale(2, RoundingMode.HALF_UP);
  }

  static boolean isPositive(BigDecimal value) {
    return value != null && value.signum() > 0;
  }

  private static String format(BigDecimal value, int minimum, int maximum) {
    NumberFormat format = NumberFormat.getNumberInstance(BRAZIL);
    format.setMinimumFractionDigits(minimum);
    format.setMaximumFractionDigits(maximum);
    format.setRoundingMode(RoundingMode.HALF_UP);
    return format.format(value);
  }
}
