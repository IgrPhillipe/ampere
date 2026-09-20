package br.com.ampere.dto;

import br.com.ampere.domain.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Credentials posted to {@code POST /auth/login}.
 *
 * <p>The e-mail is folded in the compact constructor, before validation runs: typed with a trailing
 * space — which a phone keyboard adds on its own — {@code @Email} rejected it and the person got
 * "check the data you sent" instead of being signed in.
 */
public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {

  public LoginRequest {
    email = User.normalizeEmail(email);
  }
}
