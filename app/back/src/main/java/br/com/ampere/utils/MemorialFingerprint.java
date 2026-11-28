package br.com.ampere.utils;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

public final class MemorialFingerprint {

  private static final int CODE_DIGITS = 16;
  private static final SecureRandom RANDOM = new SecureRandom();

  private MemorialFingerprint() {}

  public static String sha256(byte[] content) {
    return HexFormat.of().formatHex(digest(content));
  }

  public static byte[] digest(byte[] content) {
    try {
      return MessageDigest.getInstance("SHA-256").digest(content);
    } catch (NoSuchAlgorithmException impossible) {
      throw new IllegalStateException(impossible);
    }
  }

  /** For a file whose bytes carry no rendering to derive the code from, such as the spreadsheet. */
  public static String randomCode() {
    byte[] digits = new byte[CODE_DIGITS / 2];
    RANDOM.nextBytes(digits);

    return grouped(HexFormat.of().withUpperCase().formatHex(digits));
  }

  public static String verificationCode(String sha256) {
    return grouped(sha256.substring(0, CODE_DIGITS).toUpperCase(Locale.ROOT));
  }

  /** The code as stored, however it was typed. Empty when it cannot be one. */
  public static Optional<String> normalize(String typed) {
    String digits = typed.replaceAll("[^0-9A-Za-z]", "").toUpperCase(Locale.ROOT);

    return digits.length() == CODE_DIGITS ? Optional.of(grouped(digits)) : Optional.empty();
  }

  private static String grouped(String digits) {
    return digits.replaceAll("(.{4})(?=.)", "$1-");
  }
}
