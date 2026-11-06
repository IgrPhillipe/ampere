package br.com.ampere.utils;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class CsvFileTest {

  @Test
  void startsWithTheBomAndEndsEachRowWithCrlf() {
    byte[] content = CsvFile.encode(List.of(List.of("a", "b"), List.of("c", "d")));

    assertThat(content).startsWith((byte) 0xef, (byte) 0xbb, (byte) 0xbf);
    assertThat(new String(content, StandardCharsets.UTF_8)).endsWith("a;b\r\nc;d\r\n");
  }

  @Test
  void quotesSeparatorsQuotesAndLineBreaks() {
    String csv =
        new String(
            CsvFile.encode(List.of(List.of("Rua; 1", "Bloco \"A\"", "linha\nnova", "simples"))),
            StandardCharsets.UTF_8);

    assertThat(csv).endsWith("\"Rua; 1\";\"Bloco \"\"A\"\"\";\"linha\nnova\";simples\r\n");
  }

  @ParameterizedTest
  @ValueSource(strings = {"=1+1", "+55", "-Torre", "@soma", " =1+1", "\t=1+1", "\r\n=1+1"})
  void neutralizesWhatASpreadsheetWouldRunAsAFormula(String value) {
    assertThat(CsvFile.text(value)).isEqualTo("'" + value);
  }

  @ParameterizedTest
  @ValueSource(strings = {"", "   ", "Edifício 1=2", "Rua A-1"})
  void keepsOrdinaryText(String value) {
    assertThat(CsvFile.text(value)).isEqualTo(value);
  }
}
