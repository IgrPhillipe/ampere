package br.com.ampere.security;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Assinatura e validade do token.
 *
 * @param secret chave HMAC, vinda de {@code JWT_SECRET}. Vazia fora de producao significa "gere
 *     uma"; vazia em producao e erro de configuracao. Ver {@link JwtSecret}.
 * @param expiration por quanto tempo o token vale
 */
@ConfigurationProperties(prefix = "ampere.jwt")
public record JwtProperties(String secret, Duration expiration) {}
