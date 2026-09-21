package br.com.ampere.config;

import br.com.ampere.error.BusinessException;
import java.util.Arrays;
import java.util.Locale;
import java.util.stream.Collectors;
import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.core.convert.converter.ConverterFactory;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import tools.jackson.databind.MapperFeature;

/** Configures case-insensitive conversion to enum values, in query parameters and in the body. */
@Configuration
public class EnumParameterConfig implements WebMvcConfigurer {

  @Override
  public void addFormatters(FormatterRegistry registry) {
    registry.addConverterFactory(new StringToEnumConverterFactory());
  }

  /** An enum in the request body goes through Jackson, not through the converter above. */
  @Bean
  JsonMapperBuilderCustomizer caseInsensitiveBodyEnums() {
    return builder -> builder.enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS);
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  private static final class StringToEnumConverterFactory
      implements ConverterFactory<String, Enum> {

    @Override
    public <T extends Enum> Converter<String, T> getConverter(Class<T> targetType) {
      return source -> convert(source, targetType);
    }

    private static <T extends Enum> T convert(String source, Class<T> targetType) {
      if (source == null || source.isBlank()) {
        return null;
      }

      try {
        return (T) Enum.valueOf(targetType, source.trim().toUpperCase(Locale.ROOT));
      } catch (IllegalArgumentException exception) {
        String acceptedValues =
            Arrays.stream(targetType.getEnumConstants())
                .map(Enum::name)
                .collect(Collectors.joining(", "));
        throw new BusinessException("Valor inválido. Valores aceitos: " + acceptedValues + ".");
      }
    }
  }
}
