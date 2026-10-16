package br.com.ampere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Body of {@code PUT /users/me/password}. */
public record ChangePasswordRequest(
    @NotBlank(message = "A senha atual é obrigatória.") String currentPassword,
    @NotBlank(message = "A nova senha é obrigatória.")
        @Pattern(regexp = Passwords.POLICY, message = Passwords.MESSAGE)
        String newPassword) {}
