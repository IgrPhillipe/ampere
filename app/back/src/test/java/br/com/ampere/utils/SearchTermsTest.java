package br.com.ampere.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SearchTermsTest {

  @Test
  void normalizesBlankTerms() {
    assertThat(SearchTerms.normalize(null)).isEmpty();
    assertThat(SearchTerms.normalize("   ")).isEmpty();
    assertThat(SearchTerms.fold(null)).isEmpty();
  }

  @Test
  void trimsAndEscapesLikeWildcards() {
    assertThat(SearchTerms.normalize("  vila%_\\nova  ")).isEqualTo("vila\\%\\_\\\\nova");
  }

  @Test
  void foldsAccentsAndCase() {
    assertThat(SearchTerms.fold("  Edifício Aurora  ")).isEqualTo("edificio aurora");
    assertThat(SearchTerms.fold("JABOATÃO")).isEqualTo("jaboatao");
  }

  @Test
  void foldsBeforeEscaping() {
    assertThat(SearchTerms.normalize("Ção%")).isEqualTo("cao\\%");
  }
}
