package br.com.ampere.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.error.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.core.convert.ConversionFailedException;
import org.springframework.format.support.DefaultFormattingConversionService;

class EnumParameterConfigTest {

  private final DefaultFormattingConversionService conversionService = conversionService();

  @Test
  void convertsEnumParametersIgnoringCaseAndWhitespace() {
    assertThat(conversionService.convert(" rejected ", ProjectStatus.class))
        .isEqualTo(ProjectStatus.REJECTED);
    assertThat(conversionService.convert("", ProjectStatus.class)).isNull();
  }

  @Test
  void reportsAcceptedValuesForInvalidEnumParameters() {
    assertThatThrownBy(() -> conversionService.convert("unknown", ProjectStatus.class))
        .isInstanceOf(ConversionFailedException.class)
        .hasRootCauseInstanceOf(BusinessException.class)
        .rootCause()
        .hasMessageContaining("DRAFT")
        .hasMessageContaining("APPROVED");
  }

  private static DefaultFormattingConversionService conversionService() {
    DefaultFormattingConversionService conversionService = new DefaultFormattingConversionService();
    new EnumParameterConfig().addFormatters(conversionService);
    return conversionService;
  }
}
