package br.com.ampere.security;

import java.util.List;
import java.util.stream.Stream;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Preview origins have a default, so Vercel deploy previews work without a Render variable. */
@ConfigurationProperties(prefix = "ampere.cors")
public record CorsProperties(List<String> allowedOrigins, List<String> previewOrigins) {

  public CorsProperties {
    allowedOrigins = allowedOrigins == null ? List.of() : List.copyOf(allowedOrigins);
    previewOrigins = previewOrigins == null ? List.of() : List.copyOf(previewOrigins);
  }

  public List<String> origins() {
    return Stream.concat(allowedOrigins.stream(), previewOrigins.stream())
        .filter(origin -> !origin.isBlank())
        .distinct()
        .toList();
  }

  public boolean isEnabled() {
    return !origins().isEmpty();
  }
}
