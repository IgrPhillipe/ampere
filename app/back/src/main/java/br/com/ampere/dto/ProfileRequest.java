package br.com.ampere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Professional data edited in "Meu Perfil". The e-mail is not editable. */
public record ProfileRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Size(max = 20) String crea,
    @NotBlank @Pattern(regexp = "[A-Za-z]{2}", message = "Informe a UF com duas letras.")
        String creaState,
    @Size(max = 120) String company,
    @Size(max = 20) String phone) {}
