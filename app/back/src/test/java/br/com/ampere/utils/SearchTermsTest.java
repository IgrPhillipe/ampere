package br.com.ampere.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SearchTermsTest {

  @Test
  void normalizesBlankTerms() {
    assertThat(SearchTerms.normalize(null)).isEmpty();
    assertThat(SearchTerms.normalize("   ")).isEmpty();
  }

  @Test
  void trimsAndEscapesLikeWildcards() {
    assertThat(SearchTerms.normalize("  vila%_\\nova  ")).isEqualTo("vila\\%\\_\\\\nova");
  }
}
