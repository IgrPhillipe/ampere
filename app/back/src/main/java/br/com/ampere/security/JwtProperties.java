package br.com.ampere.security;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ampere.jwt")
public record JwtProperties(String secret, Duration expiration) {}
