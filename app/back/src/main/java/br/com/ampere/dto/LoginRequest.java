package br.com.ampere.dto;

import br.com.ampere.domain.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Credentials posted to {@code POST /auth/login}. */
public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {

  public LoginRequest {
    email = User.normalizeEmail(email);
  }
}
