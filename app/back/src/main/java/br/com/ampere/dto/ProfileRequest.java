package br.com.ampere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Data edited in "Meu Perfil". The e-mail is not editable; the CREA is required of designers. */
public record ProfileRequest(
    @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 120, message = "O nome deve ter no máximo {max} caracteres.")
        String name,
    @Pattern(regexp = Crea.NUMBER, message = Crea.NUMBER_MESSAGE) String crea,
    @Pattern(regexp = Crea.STATE, message = Crea.STATE_MESSAGE) String creaState,
    @Size(max = 120, message = "A empresa deve ter no máximo {max} caracteres.") String company,
    @Size(max = 20, message = "O telefone deve ter no máximo {max} caracteres.") String phone) {}
