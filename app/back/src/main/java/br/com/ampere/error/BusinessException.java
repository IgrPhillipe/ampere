package br.com.ampere.error;

import org.springframework.http.HttpStatus;

/**
 * Regra de negocio violada. Vira 400 por padrao, ou 409 quando o conflito e com um estado que ja
 * existe.
 *
 * <p>Como em {@link NotFoundException}, a mensagem e texto de tela em portugues.
 */
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
