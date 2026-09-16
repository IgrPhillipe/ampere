package br.com.ampere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Corpo aceito na criacao.
 *
 * <p>As mensagens sao texto de tela: o front monta "campo: mensagem" a partir delas.
 */
public record ExampleRequest(
    @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
        String name) {}
