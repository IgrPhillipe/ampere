package br.com.ampere.error;

import org.springframework.http.HttpStatus;

/** Regra de negocio violada. */
public class BusinessException extends RuntimeException {

  private final HttpStatus status;

  public BusinessException(String message) {
    this(message, HttpStatus.BAD_REQUEST);
  }

  public BusinessException(String message, HttpStatus status) {
    super(message);
    this.status = status;
  }

  public HttpStatus getStatus() {
    return status;
  }
}
