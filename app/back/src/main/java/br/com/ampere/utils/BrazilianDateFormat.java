package br.com.ampere.utils;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

public final class BrazilianDateFormat {

  private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
  private static final DateTimeFormatter DATE_TIME =
      DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

  private BrazilianDateFormat() {}

  public static String date(LocalDate value) {
    return value.format(DATE);
  }

  public static String dateTime(OffsetDateTime value) {
    return value.atZoneSameInstant(Timestamps.ZONE).format(DATE_TIME);
  }
}
