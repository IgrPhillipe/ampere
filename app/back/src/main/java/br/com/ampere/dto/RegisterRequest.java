package br.com.ampere.dto;

import br.com.ampere.domain.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Sign-up posted to {@code POST /auth/register}. */
public record RegisterRequest(
    @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 120, message = "O nome deve ter no máximo {max} caracteres.")
        String name,
    @NotBlank(message = "O e-mail é obrigatório.") @Email(message = "Informe um e-mail válido.")
        String email,
    @NotBlank(message = "A senha é obrigatória.")
        @Pattern(regexp = Passwords.POLICY, message = Passwords.MESSAGE)
        String password,
    @NotBlank(message = "O CREA é obrigatório.")
        @Pattern(regexp = Crea.NUMBER, message = Crea.NUMBER_MESSAGE)
        String crea,
    @NotBlank(message = "A UF do CREA é obrigatória.")
        @Pattern(regexp = Crea.STATE, message = Crea.STATE_MESSAGE)
        String creaState,
    @Size(max = 120, message = "A empresa deve ter no máximo {max} caracteres.") String company,
    @NotBlank(message = "O telefone é obrigatório.")
        @Size(max = 20, message = "O telefone deve ter no máximo {max} caracteres.")
        String phone) {

  public RegisterRequest {
    email = User.normalizeEmail(email);
  }
}
