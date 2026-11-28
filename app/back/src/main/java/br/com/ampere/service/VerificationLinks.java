package br.com.ampere.service;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/** The public page that checks a document, printed in its QR code and verification sheet. */
@Component
public class VerificationLinks {

  private static final Logger log = LoggerFactory.getLogger(VerificationLinks.class);

  static final String PATH = "/verificar-autenticidade";
  static final String DEVELOPMENT_URL = "http://localhost:5173";

  private static final Set<String> LOCAL_HOSTS = Set.of("localhost", "127.0.0.1", "[::1]", "::1");

  private final String frontUrl;

  public VerificationLinks(
      @Value("${ampere.front-url:}") String frontUrl, Environment environment) {
    this.frontUrl = resolve(frontUrl, environment.matchesProfiles("prod"));
  }

  /** A signed memorial keeps its link forever, so prod refuses a missing or local one. */
  static String resolve(String configured, boolean isProduction) {
    if (configured == null || configured.isBlank()) {
      if (isProduction) {
        throw new IllegalStateException(
            "FRONT_URL não definida. Defina a origem pública do front antes de subir em produção.");
      }
      log.warn("FRONT_URL não definida: os documentos apontam para {}.", DEVELOPMENT_URL);

      return DEVELOPMENT_URL;
    }
    String url = configured.trim().replaceAll("/+$", "");
    if (isProduction) {
      URI uri;
      try {
        uri = URI.create(url);
      } catch (IllegalArgumentException invalid) {
        throw new IllegalStateException("FRONT_URL inválida: " + url, invalid);
      }
      if (!"https".equals(uri.getScheme())
          || uri.getHost() == null
          || LOCAL_HOSTS.contains(uri.getHost())) {
        throw new IllegalStateException(
            "FRONT_URL precisa ser um endereço https público em produção: " + url);
      }
    }

    return url;
  }

  public String page() {
    return frontUrl + PATH;
  }

  public String forCode(String code) {
    return page() + "?codigo=" + URLEncoder.encode(code, StandardCharsets.UTF_8);
  }
}
