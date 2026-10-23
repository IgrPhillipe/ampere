package br.com.ampere.dto;

import br.com.ampere.domain.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Body of {@code PUT /admin/users/{id}}: deactivating and reactivating go through here. */
public record UpdateUserRequest(
    @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 120, message = "O nome deve ter no máximo {max} caracteres.")
        String name,
    @NotNull(message = "O papel é obrigatório.") UserRole role,
    @NotNull(message = "A situação é obrigatória.") Boolean active) {}
