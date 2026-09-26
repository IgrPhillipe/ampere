package br.com.ampere.dto;

import br.com.ampere.domain.NormativeTableCode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record NormativeTableRequest(
    @NotNull(message = "A tabela é obrigatória.") NormativeTableCode code,
    @NotBlank(message = "A identificação impressa é obrigatória.")
        @Size(max = 60, message = "A identificação deve ter no máximo {max} caracteres.")
        String identification,
    @NotBlank(message = "O item da norma é obrigatório.")
        @Size(max = 60, message = "O item deve ter no máximo {max} caracteres.")
        String item,
    @NotBlank(message = "A página impressa é obrigatória.")
        @Size(max = 20, message = "A página deve ter no máximo {max} caracteres.")
        String page,
    @NotEmpty(message = "Cadastre ao menos uma linha da tabela.")
        @Size(max = 200, message = "Cadastre no máximo {max} linhas.")
        List<@Valid NormativeTableRowRequest> rows) {}
