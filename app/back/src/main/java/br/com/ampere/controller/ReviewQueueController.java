package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.PageQuery;
import br.com.ampere.dto.Pagination;
import br.com.ampere.dto.ReviewQueueIndicatorsResponse;
import br.com.ampere.dto.ReviewQueueItemResponse;
import br.com.ampere.service.ReviewQueueListing;
import br.com.ampere.service.ReviewQueueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Review queue", description = "Fila de análise técnica dos projetos enviados")
@RestController
@RequestMapping("/review-queue")
public class ReviewQueueController {

  private final ReviewQueueService service;

  public ReviewQueueController(ReviewQueueService service) {
    this.service = service;
  }

  @GetMapping
  @Operation(
      operationId = "listReviewQueue",
      summary = "Lista os projetos em análise, ordenados pelo prazo")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Página da fila de análise"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Paginação inválida"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas o papel ADMIN acessa a fila")
  })
  public ApiResponse<List<ReviewQueueItemResponse>> list(
      @Valid @ParameterObject PageQuery pagination,
      @Parameter(description = "Só os projetos que vencem hoje ou estão atrasados")
          @RequestParam(defaultValue = "false")
          boolean dueSoon) {
    ReviewQueueListing listing = service.list(pagination.page(), pagination.pageSize(), dueSoon);
    List<ReviewQueueItemResponse> items =
        listing.entries().stream().map(ReviewQueueItemResponse::from).toList();

    return ApiResponse.of(
        items, new Pagination(listing.totalElements(), pagination.page(), pagination.pageSize()));
  }

  @GetMapping("/indicators")
  @Operation(
      operationId = "getReviewQueueIndicators",
      summary = "Indicadores exibidos no topo da fila de análise")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Indicadores da fila"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas o papel ADMIN acessa a fila")
  })
  public ApiResponse<ReviewQueueIndicatorsResponse> indicators() {
    return ApiResponse.of(ReviewQueueIndicatorsResponse.from(service.indicators()));
  }
}
