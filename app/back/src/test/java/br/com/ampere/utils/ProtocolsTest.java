package br.com.ampere.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;

class ProtocolsTest {

  @Test
  void formatsTheSequenceWithFourDigits() {
    assertThat(Protocols.format(2026, 1)).isEqualTo("2026-0001");
    assertThat(Protocols.format(2026, 1007)).isEqualTo("2026-1007");
    assertThat(Protocols.yearPrefix(2026)).isEqualTo("2026");
  }

  @Test
  void startsTheYearAtTheFirstSequence() {
    assertThat(Protocols.next(2026, null)).isEqualTo("2026-0001");
    assertThat(Protocols.next(2026, "  ")).isEqualTo("2026-0001");
  }

  @Test
  void continuesFromTheHighestProtocolOfTheYear() {
    assertThat(Protocols.next(2026, "2026-1006")).isEqualTo("2026-1007");
    assertThat(Protocols.next(2026, "2026-0009")).isEqualTo("2026-0010");
  }

  @Test
  void keepsAlphabeticalOrderEqualToNumericOrder() {
    List<String> protocols =
        List.of(
            Protocols.format(2026, 1),
            Protocols.format(2026, 9),
            Protocols.format(2026, 10),
            Protocols.format(2026, 100),
            Protocols.format(2026, 1006));

    assertThat(protocols).isSorted();
  }

  @Test
  void failsWhenTheYearlySequenceIsExhausted() {
    assertThatThrownBy(() -> Protocols.next(2026, "2026-9999"))
        .isInstanceOf(IllegalStateException.class);
  }

  @Test
  void refusesAProtocolItCouldNotHaveWritten() {
    assertThatThrownBy(() -> Protocols.next(2026, "2026"))
        .isInstanceOf(IllegalStateException.class);
    assertThatThrownBy(() -> Protocols.next(2026, "2026-abcd"))
        .isInstanceOf(IllegalStateException.class);
  }
}
