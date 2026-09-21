package br.com.ampere.security;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Token signature and lifetime. */
@ConfigurationProperties(prefix = "ampere.jwt")
public record JwtProperties(String secret, Duration expiration) {}
