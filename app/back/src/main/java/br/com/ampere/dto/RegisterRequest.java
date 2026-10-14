package br.com.ampere.dto;

import br.com.ampere.domain.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Sign-up posted to {@code POST /auth/register}. */
public record RegisterRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Email String email,
    @NotBlank @Pattern(regexp = Passwords.POLICY, message = Passwords.MESSAGE) String password,
    @NotBlank @Size(max = 20) String crea,
    @NotBlank @Pattern(regexp = "[A-Za-z]{2}", message = "Informe a UF com duas letras.")
        String creaState,
    @Size(max = 120) String company,
    @Size(max = 20) String phone) {

  public RegisterRequest {
    email = User.normalizeEmail(email);
  }
}
