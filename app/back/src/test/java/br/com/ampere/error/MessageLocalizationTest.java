package br.com.ampere.error;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Locale;
import org.junit.jupiter.api.Test;
import org.springframework.context.support.ResourceBundleMessageSource;

class MessageLocalizationTest {

  @Test
  void localizesIntegerTypeMismatchMessages() {
    ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
    messageSource.setBasename("messages");
    messageSource.setDefaultEncoding("UTF-8");

    assertThat(
            messageSource.getMessage(
                "typeMismatch.java.lang.Integer", null, Locale.forLanguageTag("pt-BR")))
        .isEqualTo("Informe um número inteiro.");
  }
}
