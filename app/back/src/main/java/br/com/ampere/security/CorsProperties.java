package br.com.ampere.security;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Origens que podem chamar a API de outro dominio.
 *
 * <p>Vazio significa **so mesma origem**, que e o caso quando o front sai por um proxy no proprio
 * deploy. Front e API em dominios diferentes — Vercel chamando Render, por exemplo — precisam da
 * origem listada aqui, ou o navegador recusa a resposta.
 *
 * @param allowedOrigins origens exatas ou padroes ({@code https://*.vercel.app}), separadas por
 *     virgula em {@code CORS_ALLOWED_ORIGINS}
 */
@ConfigurationProperties(prefix = "ampere.cors")
public record CorsProperties(List<String> allowedOrigins) {

  public CorsProperties {
    allowedOrigins = allowedOrigins == null ? List.of() : List.copyOf(allowedOrigins);
  }

  public boolean isEnabled() {
    return !allowedOrigins.isEmpty();
  }
}
