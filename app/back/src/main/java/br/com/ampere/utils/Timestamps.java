package br.com.ampere.utils;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;

/** Current time at the precision PostgreSQL stores, so a value echoed back equals a reread one. */
public final class Timestamps {

  /** Dates and deadlines follow the concessionaire's local calendar. */
  public static final String ZONE_ID = "America/Recife";

  public static final ZoneId ZONE = ZoneId.of(ZONE_ID);

  private Timestamps() {}

  public static OffsetDateTime now() {
    return OffsetDateTime.now(ZoneOffset.UTC).truncatedTo(ChronoUnit.MICROS);
  }

  public static LocalDate localDate(OffsetDateTime instant) {
    return instant.atZoneSameInstant(ZONE).toLocalDate();
  }

  /** Calendar days between the local dates of two instants. */
  public static long daysBetween(OffsetDateTime start, OffsetDateTime end) {
    return ChronoUnit.DAYS.between(localDate(start), localDate(end));
  }
}
