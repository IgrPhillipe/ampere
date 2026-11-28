package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.env.MockEnvironment;

class VerificationLinksTest {

  @Test
  void productionKeepsAPublicHttpsOrigin() {
    assertThat(VerificationLinks.resolve("https://ampere-virid.vercel.app/", true))
        .isEqualTo("https://ampere-virid.vercel.app");
  }

  @ParameterizedTest
  @NullAndEmptySource
  @ValueSource(
      strings = {
        "http://ampere-virid.vercel.app",
        "https://localhost:5173",
        "https://127.0.0.1",
        "http://localhost:5173",
        "ampere-virid.vercel.app",
        "https://exemplo com espaço"
      })
  void productionRefusesAMissingLocalOrInsecureOrigin(String configured) {
    assertThatThrownBy(() -> VerificationLinks.resolve(configured, true))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("FRONT_URL");
  }

  @Test
  void developmentFallsBackToTheViteServer() {
    assertThat(VerificationLinks.resolve("", false)).isEqualTo("http://localhost:5173");
    assertThat(VerificationLinks.resolve("http://localhost:5179", false))
        .isEqualTo("http://localhost:5179");
  }

  @Test
  void theLinkCarriesTheCode() {
    VerificationLinks links = new VerificationLinks("https://ampere.test", new MockEnvironment());

    assertThat(links.forCode("7F3A-91C2-04BD-2E77"))
        .isEqualTo("https://ampere.test/verificar-autenticidade?codigo=7F3A-91C2-04BD-2E77");
  }
}
