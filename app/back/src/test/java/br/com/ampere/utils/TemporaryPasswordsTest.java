package br.com.ampere.utils;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class TemporaryPasswordsTest {

  /** The same policy a chosen password must follow, so the user can keep the generated one. */
  private static final String POLICY = "^(?=.*\\p{L})(?=.*\\d).{8,72}$";

  @Test
  void alwaysPassesThePasswordPolicy() {
    for (int attempt = 0; attempt < 500; attempt++) {
      assertThat(TemporaryPasswords.generate()).matches(POLICY);
    }
  }

  @Test
  void leavesOutCharactersThatReadAlike() {
    for (int attempt = 0; attempt < 500; attempt++) {
      assertThat(TemporaryPasswords.generate()).doesNotContainPattern("[0O1lI]");
    }
  }

  @Test
  void isNotRepeated() {
    Set<String> passwords = new HashSet<>();
    for (int attempt = 0; attempt < 200; attempt++) {
      passwords.add(TemporaryPasswords.generate());
    }

    assertThat(passwords).hasSize(200);
  }
}
