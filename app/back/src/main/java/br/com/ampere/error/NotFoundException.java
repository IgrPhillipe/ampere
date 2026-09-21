package br.com.ampere.error;

/** The requested resource does not exist. Becomes a 404. */
public class NotFoundException extends RuntimeException {

  public NotFoundException(String message) {
    super(message);
  }
}
