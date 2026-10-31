package br.com.ampere.utils;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class TimestampsTest {

  @Test
  void keepsNoMoreThanMicroseconds() {
    for (int attempt = 0; attempt < 100; attempt++) {
      assertThat(Timestamps.now().getNano() % 1_000).isZero();
    }
  }

  @Test
  void isInUtc() {
    assertThat(Timestamps.now().getOffset()).isEqualTo(ZoneOffset.UTC);
  }
}
