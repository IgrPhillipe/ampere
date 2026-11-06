package br.com.ampere.utils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.Locale;

/** Formats exported values using the same two decimal places shown by the application. */
public final class BrazilianNumberFormat {

  private static final Locale LOCALE = Locale.forLanguageTag("pt-BR");

  private BrazilianNumberFormat() {}

  public static String format(BigDecimal value) {
    if (value == null) {
      return "";
    }

    NumberFormat format = NumberFormat.getNumberInstance(LOCALE);
    format.setGroupingUsed(true);
    format.setMinimumFractionDigits(2);
    format.setMaximumFractionDigits(2);
    format.setRoundingMode(RoundingMode.HALF_UP);

    return format.format(value);
  }

  public static String format(long value) {
    NumberFormat format = NumberFormat.getIntegerInstance(LOCALE);
    format.setGroupingUsed(true);

    return format.format(value);
  }
}
