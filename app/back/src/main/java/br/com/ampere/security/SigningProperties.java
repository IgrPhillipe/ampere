package br.com.ampere.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** The PKCS12 that signs the official documents, in base64, and its password. */
@ConfigurationProperties(prefix = "ampere.signing")
public record SigningProperties(String keystore, String password) {}
