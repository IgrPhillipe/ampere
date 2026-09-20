package br.com.ampere.security;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Assinatura e validade do token.
 *
 * <p>O segredo tem default de desenvolvimento para o repositorio subir e rodar sem configuracao,
 * como o resto do projeto. {@link SecurityConfig} recusa subir com esse default fora de
 * desenvolvimento — segredo versionado nao protege ninguem.
 *
 * @param secret chave HMAC. HS256 exige 256 bits, entao no minimo 32 caracteres.
 * @param expiration por quanto tempo o token vale
 */
@ConfigurationProperties(prefix = "ampere.jwt")
public record JwtProperties(String secret, Duration expiration) {

  /** Marcado no `application.properties`; existir em producao e erro de configuracao. */
  public static final String DEVELOPMENT_SECRET =
      "ampere-desenvolvimento-troque-este-segredo-em-producao";

  public boolean usesDevelopmentSecret() {
    return DEVELOPMENT_SECRET.equals(secret);
  }
}
