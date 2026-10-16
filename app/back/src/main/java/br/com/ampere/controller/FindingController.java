package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.FindingRequest;
import br.com.ampere.dto.FindingResolutionRequest;
import br.com.ampere.dto.FindingResponse;
import br.com.ampere.service.AuthenticatedUser;
import br.com.ampere.service.FindingParameters;
import br.com.ampere.service.FindingService;
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

@Tag(name = "Review findings", description = "Apontamentos pontuais da análise técnica")
@RestController
@RequestMapping("/projects/{projectId}/findings")
public class FindingController {

  private final FindingService service;

  public FindingController(FindingService service) {
    this.service = service;
  }

  @GetMapping
  @Operation(
      operationId = "listFindings",
      summary = "Lista os apontamentos do projeto; o projetista não vê os rascunhos")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Apontamentos do projeto"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado")
  })
  public ApiResponse<List<FindingResponse>> list(
      @PathVariable Long projectId, @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        service.list(projectId, userOf(jwt)).stream().map(FindingResponse::from).toList());
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(operationId = "createFinding", summary = "Cria um apontamento em rascunho")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "201",
        description = "Apontamento criado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Dados inválidos, ou referência fora da etapa"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas o analista responsável registra apontamentos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto ou grupo não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "O projeto não está em análise")
  })
  public ApiResponse<FindingResponse> create(
      @PathVariable Long projectId,
      @Valid @RequestBody FindingRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        FindingResponse.from(service.create(projectId, parametersOf(request), userOf(jwt))));
  }

  @PutMapping("/{findingId}")
  @Operation(operationId = "updateFinding", summary = "Atualiza um apontamento em rascunho")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Apontamento atualizado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Dados inválidos, ou referência fora da etapa"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas o analista responsável altera apontamentos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto, apontamento ou grupo não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "O projeto não está em análise, ou o apontamento já foi publicado")
  })
  public ApiResponse<FindingResponse> update(
      @PathVariable Long projectId,
      @PathVariable Long findingId,
      @Valid @RequestBody FindingRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        FindingResponse.from(
            service.update(projectId, findingId, parametersOf(request), userOf(jwt))));
  }

  @DeleteMapping("/{findingId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(operationId = "deleteFinding", summary = "Exclui um apontamento em rascunho")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "204",
        description = "Apontamento excluído"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas o analista responsável exclui apontamentos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto ou apontamento não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "O projeto não está em análise, ou o apontamento já foi publicado")
  })
  public void delete(
      @PathVariable Long projectId,
      @PathVariable Long findingId,
      @AuthenticationPrincipal Jwt jwt) {
    service.delete(projectId, findingId, userOf(jwt));
  }

  @PostMapping("/{findingId}/resolution")
  @Operation(
      operationId = "resolveFinding",
      summary = "Aceita a correção ou reabre um apontamento na reanálise")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Apontamento resolvido ou reaberto"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Resolução ausente ou inválida"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas o analista responsável resolve apontamentos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto ou apontamento não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "O projeto não está em análise, ou o apontamento é do ciclo atual")
  })
  public ApiResponse<FindingResponse> resolve(
      @PathVariable Long projectId,
      @PathVariable Long findingId,
      @Valid @RequestBody FindingResolutionRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        FindingResponse.from(
            service.resolve(projectId, findingId, request.resolution(), userOf(jwt))));
  }

  private static FindingParameters parametersOf(FindingRequest request) {
    return new FindingParameters(
        request.severity(),
        request.stage(),
        request.consumerUnitGroupId(),
        request.calculationStepCode(),
        request.documentType(),
        request.description(),
        request.standardItem());
  }

  private static AuthenticatedUser userOf(Jwt jwt) {
    return AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role"));
  }
}
