package br.com.ampere.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Envelope de toda resposta de sucesso da API.
 *
 * <p>Espelha o tipo {@code ApiResponse<T>} do front-end em {@code
 * app/front/src/features/shared/types/index.ts}. O {@code pagination} e omitido quando nulo porque
 * do outro lado ele e opcional.
 *
 * <p>Respostas de sucesso sao sempre embrulhadas; <strong>erros nunca</strong> — esses saem como
 * {@link org.springframework.http.ProblemDetail} cru.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(T data, Pagination pagination) {

  public static <T> ApiResponse<T> of(T data) {
    return new ApiResponse<>(data, null);
  }

  public static <T> ApiResponse<T> of(T data, Pagination pagination) {
    return new ApiResponse<>(data, pagination);
  }
}
