package br.com.ampere.dto;

/** The minimum password policy: 8 characters, with at least one letter and one digit. */
final class Passwords {

  static final String POLICY = "^(?=.*\\p{L})(?=.*\\d).{8,72}$";
  static final String MESSAGE = "A senha deve ter ao menos 8 caracteres, com letra e número.";

  private Passwords() {}
}
