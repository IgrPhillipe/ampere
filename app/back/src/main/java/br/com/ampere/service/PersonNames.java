package br.com.ampere.service;

import br.com.ampere.domain.User;
import java.util.Map;

/** The account name of each e-mail; an e-mail without an account stays as it is. */
public record PersonNames(Map<String, String> byEmail) {

  public static PersonNames none() {
    return new PersonNames(Map.of());
  }

  public PersonNames {
    byEmail = Map.copyOf(byEmail);
  }

  public String of(String email) {
    if (email == null) {
      return null;
    }

    return byEmail.getOrDefault(User.normalizeEmail(email), email);
  }
}
