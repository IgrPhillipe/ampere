package br.com.ampere.utils;

import java.security.SecureRandom;

/** Passwords the administrator hands over by hand, so no characters that read alike. */
public final class TemporaryPasswords {

  private static final String LETTERS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  private static final String DIGITS = "23456789";
  private static final String ALPHABET = LETTERS + DIGITS;
  private static final int LENGTH = 12;
  private static final SecureRandom RANDOM = new SecureRandom();

  private TemporaryPasswords() {}

  /** Always has a letter and a digit, so it passes the same policy as a chosen password. */
  public static String generate() {
    char[] password = new char[LENGTH];
    password[0] = pick(LETTERS);
    password[1] = pick(DIGITS);
    for (int index = 2; index < LENGTH; index++) {
      password[index] = pick(ALPHABET);
    }

    for (int index = LENGTH - 1; index > 0; index--) {
      int other = RANDOM.nextInt(index + 1);
      char swap = password[index];
      password[index] = password[other];
      password[other] = swap;
    }

    return new String(password);
  }

  private static char pick(String characters) {
    return characters.charAt(RANDOM.nextInt(characters.length()));
  }
}
