package br.com.ampere.controller;

import br.com.ampere.domain.ReviewQueueFilter;
import br.com.ampere.domain.ReviewQueueSort;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.PageQuery;
import br.com.ampere.dto.Pagination;
import br.com.ampere.dto.ReviewQueueIndicatorsResponse;
import br.com.ampere.dto.ReviewQueueItemResponse;
import br.com.ampere.dto.UserOptionResponse;
import br.com.ampere.service.ReviewQueueListing;
import br.com.ampere.service.ReviewQueueQuery;
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
      summary = "Lista os projetos em análise, ordenados e filtrados")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Página da fila de análise"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Parâmetros inválidos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas analista e administrador acessam a fila")
  })
  public ApiResponse<List<ReviewQueueItemResponse>> list(
      @Valid @ParameterObject PageQuery pagination,
      @Parameter(description = "Termo buscado no protocolo, projetista ou município")
          @RequestParam(required = false)
          String search,
      @Parameter(description = "Recorte aplicado à fila de análise")
          @RequestParam(defaultValue = "ALL")
          ReviewQueueFilter filter,
      @Parameter(
              description = "Coluna usada na ordenação (deadline, submittedAt, demand, warnings)")
          @RequestParam(defaultValue = "deadline")
          ReviewQueueSort sort,
      @Parameter(description = "Direção da ordenação (ASC, DESC)")
          @RequestParam(defaultValue = "ASC")
          SortDirection direction,
      @Parameter(description = "Filtro por analista (id do usuário ou 'none' para sem analista)")
          @RequestParam(required = false)
          String reviewer,
      @Parameter(description = "Município usado para filtrar os projetos")
          @RequestParam(required = false)
          String municipality) {
    ReviewQueueListing listing =
        service.list(
            pagination.page(),
            pagination.pageSize(),
            new ReviewQueueQuery(search, filter, sort, direction, reviewer, municipality));
    List<ReviewQueueItemResponse> items =
        listing.entries().stream().map(ReviewQueueItemResponse::from).toList();

    return ApiResponse.of(
        items, new Pagination(listing.totalElements(), pagination.page(), pagination.pageSize()));
  }

  @GetMapping("/reviewers")
  @Operation(
      operationId = "listReviewers",
      summary = "Lista os analistas disponíveis para o filtro")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Lista de analistas"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas analista e administrador acessam a fila")
  })
  public ApiResponse<List<UserOptionResponse>> reviewers() {
    List<UserOptionResponse> reviewers =
        service.reviewers().stream().map(UserOptionResponse::from).toList();
    return ApiResponse.of(reviewers);
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
        description = "Apenas analista e administrador acessam a fila")
  })
  public ApiResponse<ReviewQueueIndicatorsResponse> indicators() {
    return ApiResponse.of(ReviewQueueIndicatorsResponse.from(service.indicators()));
  }
}
