package br.com.ampere.utils;

/** Builds the protocol a project is filed under: the year, a dash, and a four digit sequence. */
public final class Protocols {

  private static final String SEQUENCE_FORMAT = "%04d";
  private static final int FIRST_SEQUENCE = 1;
  private static final int MAX_SEQUENCE = 9999;
  private static final String SEPARATOR = "-";

  private Protocols() {}

  public static String yearPrefix(int year) {
    return String.valueOf(year);
  }

  public static String format(int year, int sequence) {
    if (sequence < FIRST_SEQUENCE || sequence > MAX_SEQUENCE) {
      throw new IllegalStateException("Protocol sequence out of range: " + sequence);
    }

    return yearPrefix(year) + SEPARATOR + SEQUENCE_FORMAT.formatted(sequence);
  }

  public static String next(int year, String highestOfYear) {
    if (highestOfYear == null || highestOfYear.isBlank()) {
      return format(year, FIRST_SEQUENCE);
    }

    return format(year, sequenceOf(highestOfYear) + 1);
  }

  private static int sequenceOf(String protocol) {
    int separator = protocol.lastIndexOf(SEPARATOR);
    if (separator < 0) {
      throw new IllegalStateException("Malformed protocol: " + protocol);
    }

    try {
      return Integer.parseInt(protocol.substring(separator + 1));
    } catch (NumberFormatException malformed) {
      throw new IllegalStateException("Malformed protocol: " + protocol, malformed);
    }
  }
}
