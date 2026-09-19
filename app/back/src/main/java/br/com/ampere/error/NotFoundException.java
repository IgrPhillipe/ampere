package br.com.ampere.error;

/**
 * Recurso pedido nao existe. Vira 404.
 *
 * <p>A mensagem vai direto para a tela do usuario, entao escreva em portugues e sem jargao —
 * "Projeto nao encontrado.", nao "Entity not found for id 42".
 */
public class NotFoundException extends RuntimeException {

  public NotFoundException(String message) {
    super(message);
  }
}
