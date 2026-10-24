package br.com.ampere.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ConcessionAreaTest {

  @Test
  void returnsTheIbgeSpellingOfAServedMunicipality() {
    assertThat(ConcessionArea.municipalityOf(BrazilianState.PE, " jaboatao dos guararapes "))
        .contains("Jaboatão dos Guararapes");
    assertThat(ConcessionArea.municipalityOf(BrazilianState.PE, "Fernando de Noronha"))
        .contains("Fernando de Noronha");
  }

  @Test
  void servesOnlyPedrasDeFogoInParaiba() {
    assertThat(ConcessionArea.municipalityOf(BrazilianState.PB, "Pedras de Fogo"))
        .contains("Pedras de Fogo");
    assertThat(ConcessionArea.municipalityOf(BrazilianState.PB, "João Pessoa")).isEmpty();
  }

  @Test
  void leavesUnknownPlacesAndOtherStatesOut() {
    assertThat(ConcessionArea.municipalityOf(BrazilianState.PE, "Cidade Inventada")).isEmpty();
    assertThat(ConcessionArea.municipalityOf(BrazilianState.SP, "São Paulo")).isEmpty();
    assertThat(ConcessionArea.municipalityOf(null, "Recife")).isEmpty();
  }

  @Test
  void checksThePostalCodeAgainstTheStateRange() {
    assertThat(ConcessionArea.coversPostalCode(BrazilianState.PE, "50030230")).isTrue();
    assertThat(ConcessionArea.coversPostalCode(BrazilianState.PE, "56999999")).isTrue();
    assertThat(ConcessionArea.coversPostalCode(BrazilianState.PE, "01001000")).isFalse();
    assertThat(ConcessionArea.coversPostalCode(BrazilianState.PB, "58328000")).isTrue();
    assertThat(ConcessionArea.coversPostalCode(BrazilianState.PB, "58039000")).isFalse();
    assertThat(ConcessionArea.coversPostalCode(BrazilianState.PE, "5003023")).isFalse();
  }
}
