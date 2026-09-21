package br.com.ampere.error;

/** Recurso pedido nao existe. Vira 404. */
public class NotFoundException extends RuntimeException {

  public NotFoundException(String message) {
    super(message);
  }
}
