package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.NormativeTableCodeResponse;
import br.com.ampere.dto.NormativeTableRequest;
import br.com.ampere.dto.NormativeTableResponse;
import br.com.ampere.dto.NormativeTableRowRequest;
import br.com.ampere.service.NormativeTableParameters;
import br.com.ampere.service.NormativeTableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(
    name = "Normative tables",
    description = "Cadastro e publicação das tabelas normativas lidas pelo cálculo (admin)")
@RestController
@RequestMapping("/admin/normative-tables")
public class AdminNormativeTableController {

  private final NormativeTableService service;

  public AdminNormativeTableController(NormativeTableService service) {
    this.service = service;
  }

  @GetMapping("/codes")
  @Operation(
      operationId = "listNormativeTableCodes",
      summary = "Tabelas que o cálculo lê e o sentido de cada coluna")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Catálogo das tabelas")
  })
  public ApiResponse<List<NormativeTableCodeResponse>> codes() {
    return ApiResponse.of(NormativeTableCodeResponse.all());
  }

  @GetMapping
  @Operation(operationId = "listNormativeTables", summary = "Lista as tabelas cadastradas")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Tabelas cadastradas, sem as linhas")
  })
  public ApiResponse<List<NormativeTableResponse>> list() {
    return ApiResponse.of(service.list().stream().map(NormativeTableResponse::summary).toList());
  }

  @GetMapping("/{id}")
  @Operation(operationId = "getNormativeTable", summary = "Detalha uma tabela com as linhas")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Tabela encontrada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Tabela não encontrada")
  })
  public ApiResponse<NormativeTableResponse> detail(@PathVariable Long id) {
    return ApiResponse.of(NormativeTableResponse.from(service.findById(id)));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(operationId = "createNormativeTable", summary = "Cadastra uma tabela em rascunho")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "201",
        description = "Tabela cadastrada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Linhas inválidas")
  })
  public ApiResponse<NormativeTableResponse> create(
      @Valid @RequestBody NormativeTableRequest request, @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        NormativeTableResponse.from(service.create(parametersOf(request), emailOf(jwt))));
  }

  @PutMapping("/{id}")
  @Operation(operationId = "updateNormativeTable", summary = "Atualiza uma tabela em rascunho")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Tabela atualizada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Linhas inválidas"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Tabela não encontrada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "A tabela já foi publicada")
  })
  public ApiResponse<NormativeTableResponse> update(
      @PathVariable Long id, @Valid @RequestBody NormativeTableRequest request) {
    return ApiResponse.of(NormativeTableResponse.from(service.update(id, parametersOf(request))));
  }

  @PostMapping("/{id}/publish")
  @Operation(
      operationId = "publishNormativeTable",
      summary = "Publica a tabela conferida por outra pessoa e substitui a publicada")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Tabela publicada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Tabela não encontrada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Já publicada, ou conferida por quem cadastrou")
  })
  public ApiResponse<NormativeTableResponse> publish(
      @PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(NormativeTableResponse.from(service.publish(id, emailOf(jwt))));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(operationId = "deleteNormativeTable", summary = "Exclui uma tabela em rascunho")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "204",
        description = "Tabela excluída"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Tabela não encontrada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "A tabela já foi publicada")
  })
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }

  private static NormativeTableParameters parametersOf(NormativeTableRequest request) {
    return new NormativeTableParameters(
        request.code(),
        request.identification().trim(),
        request.item().trim(),
        request.page().trim(),
        request.rows().stream().map(NormativeTableRowRequest::toRow).toList());
  }

  private static String emailOf(Jwt jwt) {
    return jwt.getClaimAsString("email");
  }
}
