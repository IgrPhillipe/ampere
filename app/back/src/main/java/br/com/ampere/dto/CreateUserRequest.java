package br.com.ampere.dto;

import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Body of {@code POST /admin/users}. The password is generated, never sent. */
public record CreateUserRequest(
    @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 120, message = "O nome deve ter no máximo {max} caracteres.")
        String name,
    @NotBlank(message = "O e-mail é obrigatório.") @Email(message = "Informe um e-mail válido.")
        String email,
    @NotNull(message = "O papel é obrigatório.") UserRole role) {

  public CreateUserRequest {
    email = User.normalizeEmail(email);
  }
}
