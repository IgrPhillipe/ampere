package br.com.ampere.security;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Origins allowed to call the API from another domain. */
@ConfigurationProperties(prefix = "ampere.cors")
public record CorsProperties(List<String> allowedOrigins) {

  public CorsProperties {
    allowedOrigins = allowedOrigins == null ? List.of() : List.copyOf(allowedOrigins);
  }

  public boolean isEnabled() {
    return !allowedOrigins.isEmpty();
  }
}
