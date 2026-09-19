package br.com.ampere.dto;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

class PageQueryTest {

  private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

  @Test
  void appliesDefaultsWhenPaginationParametersAreMissing() {
    PageQuery query = new PageQuery(null, null);

    assertThat(query.page()).isEqualTo(PageQuery.DEFAULT_PAGE);
    assertThat(query.pageSize()).isEqualTo(PageQuery.DEFAULT_PAGE_SIZE);
    assertThat(validator.validate(query)).isEmpty();
  }

  @Test
  void rejectsPaginationValuesOutsideTheSupportedRange() {
    assertThat(validator.validate(new PageQuery(0, 20)))
        .extracting(violation -> violation.getPropertyPath().toString())
        .containsExactly("page");
    assertThat(validator.validate(new PageQuery(1, 101)))
        .extracting(violation -> violation.getPropertyPath().toString())
        .containsExactly("pageSize");
  }
}
