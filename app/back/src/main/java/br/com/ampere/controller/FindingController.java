package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.FindingRequest;
import br.com.ampere.dto.FindingResolutionRequest;
import br.com.ampere.dto.FindingResponse;
import br.com.ampere.service.FindingParameters;
import br.com.ampere.service.FindingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
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
  @Operation(operationId = "listFindings", summary = "Lista os apontamentos do projeto")
  public ApiResponse<List<FindingResponse>> list(@PathVariable Long projectId) {
    return ApiResponse.of(service.list(projectId).stream().map(FindingResponse::from).toList());
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(operationId = "createFinding", summary = "Cria um apontamento em rascunho")
  public ApiResponse<FindingResponse> create(
      @PathVariable Long projectId, @Valid @RequestBody FindingRequest request) {
    return ApiResponse.of(FindingResponse.from(service.create(projectId, parametersOf(request))));
  }

  @PutMapping("/{findingId}")
  @Operation(operationId = "updateFinding", summary = "Atualiza um apontamento em rascunho")
  public ApiResponse<FindingResponse> update(
      @PathVariable Long projectId,
      @PathVariable Long findingId,
      @Valid @RequestBody FindingRequest request) {
    return ApiResponse.of(
        FindingResponse.from(service.update(projectId, findingId, parametersOf(request))));
  }

  @DeleteMapping("/{findingId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(operationId = "deleteFinding", summary = "Exclui um apontamento em rascunho")
  public void delete(@PathVariable Long projectId, @PathVariable Long findingId) {
    service.delete(projectId, findingId);
  }

  @PostMapping("/{findingId}/resolution")
  @Operation(
      operationId = "resolveFinding",
      summary = "Aceita a correção ou reabre um apontamento na reanálise")
  public ApiResponse<FindingResponse> resolve(
      @PathVariable Long projectId,
      @PathVariable Long findingId,
      @Valid @RequestBody FindingResolutionRequest request) {
    return ApiResponse.of(
        FindingResponse.from(service.resolve(projectId, findingId, request.resolution())));
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
}
