package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ConcessionAreaTest {

  @Test
  void coversEveryMunicipalityOfPernambuco() {
    assertThat(ConcessionArea.covers(BrazilianState.PE, "Fernando de Noronha")).isTrue();
  }

  @Test
  void coversOnlyPedrasDeFogoInParaiba() {
    assertThat(ConcessionArea.covers(BrazilianState.PB, " pedras de fogo ")).isTrue();
    assertThat(ConcessionArea.covers(BrazilianState.PB, "João Pessoa")).isFalse();
  }

  @Test
  void leavesOtherStatesOut() {
    assertThat(ConcessionArea.covers(BrazilianState.SP, "São Paulo")).isFalse();
    assertThat(ConcessionArea.covers(null, "Recife")).isFalse();
  }
}
