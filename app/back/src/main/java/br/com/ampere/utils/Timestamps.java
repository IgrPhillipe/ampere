package br.com.ampere.utils;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;

/** Current time at the precision PostgreSQL stores, so a value echoed back equals a reread one. */
public final class Timestamps {

  private Timestamps() {}

  public static OffsetDateTime now() {
    return OffsetDateTime.now(ZoneOffset.UTC).truncatedTo(ChronoUnit.MICROS);
  }
}
