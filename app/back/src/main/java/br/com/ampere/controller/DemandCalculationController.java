package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.CalculationResponse;
import br.com.ampere.service.DemandCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Demand calculation", description = "Memória de cálculo da demanda de um projeto")
@RestController
@RequestMapping("/projects/{projectId}/calculation")
public class DemandCalculationController {

  private final DemandCalculationService service;

  public DemandCalculationController(DemandCalculationService service) {
    this.service = service;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      operationId = "calculateDemand",
      summary = "Calcula a demanda do projeto e guarda a memória de cálculo")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "201",
        description = "Cálculo feito"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "O projeto não está mais em rascunho"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "422",
        description = "Grupos com pendência, ou tabela normativa não publicada")
  })
  public ApiResponse<CalculationResponse> calculate(@PathVariable Long projectId) {
    return ApiResponse.of(CalculationResponse.from(service.calculate(projectId)));
  }

  @GetMapping
  @Operation(operationId = "getLatestCalculation", summary = "Último cálculo de demanda do projeto")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Último cálculo"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado, ou ainda sem cálculo")
  })
  public ApiResponse<CalculationResponse> latest(@PathVariable Long projectId) {
    return ApiResponse.of(CalculationResponse.from(service.latest(projectId)));
  }
}
