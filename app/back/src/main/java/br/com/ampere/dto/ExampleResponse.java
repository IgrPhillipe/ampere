package br.com.ampere.dto;

import br.com.ampere.domain.Example;

/**
 * Representacao de saida.
 *
 * <p>O {@code id} sai como <strong>String</strong> de proposito: o schema Zod do front declara
 * {@code id: z.string()} e rejeita a resposta se vier numero.
 */
public record ExampleResponse(String id, String name) {

  public static ExampleResponse from(Example example) {
    return new ExampleResponse(String.valueOf(example.getId()), example.getName());
  }
}
