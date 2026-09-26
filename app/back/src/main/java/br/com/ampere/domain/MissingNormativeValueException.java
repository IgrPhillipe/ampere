package br.com.ampere.domain;

/** A table the calculation needs is not published, or has no row for the value. */
public class MissingNormativeValueException extends RuntimeException {

  public MissingNormativeValueException(String message) {
    super(message);
  }
}
