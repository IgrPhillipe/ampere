package br.com.ampere.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/** Pagination parameters accepted by listing endpoints. */
public record PageQuery(
    @Min(value = MIN_PAGE, message = "A página deve ser maior ou igual a {value}.") Integer page,
    @Min(value = MIN_PAGE_SIZE, message = "O tamanho da página deve ser maior ou igual a {value}.")
        @Max(value = MAX_PAGE_SIZE, message = "O tamanho da página deve ser no máximo {value}.")
        Integer pageSize) {

  public static final int MIN_PAGE = 1;
  public static final int MIN_PAGE_SIZE = 1;
  public static final int MAX_PAGE_SIZE = 100;
  public static final int DEFAULT_PAGE = 1;
  public static final int DEFAULT_PAGE_SIZE = 20;

  public PageQuery {
    page = page == null ? DEFAULT_PAGE : page;
    pageSize = pageSize == null ? DEFAULT_PAGE_SIZE : pageSize;
  }
}
