package br.com.ampere.utils;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

public final class MemorialFingerprint {

  private static final int CODE_DIGITS = 16;

  private MemorialFingerprint() {}

  public static String sha256(byte[] content) {
    try {
      return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content));
    } catch (NoSuchAlgorithmException impossible) {
      throw new IllegalStateException(impossible);
    }
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
