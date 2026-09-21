package br.com.ampere.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;

class JwtSecretTest {

  private static final String CONFIGURED = "segredo-de-teste-com-pelo-menos-32-caracteres";

  @Test
  void usesTheConfiguredSecret() {
    SecretKey key = JwtSecret.resolve(CONFIGURED, true);

    assertThat(key.getEncoded()).isEqualTo(CONFIGURED.getBytes(StandardCharsets.UTF_8));
  }

  @Test
  void refusesToStartInProductionWithoutASecret() {
    assertThatThrownBy(() -> JwtSecret.resolve(null, true))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("JWT_SECRET");
    assertThatThrownBy(() -> JwtSecret.resolve("   ", true))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("JWT_SECRET");
  }

  /** HS256 assina com 256 bits; segredo curto passaria e falharia so na primeira emissao. */
  @Test
  void refusesASecretShorterThanTheAlgorithmNeeds() {
    assertThatThrownBy(() -> JwtSecret.resolve("curto-demais", false))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("HS256");
  }

  @Test
  void generatesAKeyOutsideProductionSoTheAppStillStarts() {
    SecretKey key = JwtSecret.resolve("", false);

    assertThat(key.getEncoded()).hasSizeGreaterThanOrEqualTo(JwtSecret.MINIMUM_BYTES);
  }

  /** Chave gerada e por execucao: duas resolucoes nao podem coincidir. */
  @Test
  void generatesADifferentKeyEveryTime() {
    assertThat(JwtSecret.resolve("", false).getEncoded())
        .isNotEqualTo(JwtSecret.resolve("", false).getEncoded());
  }
}
