package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.ReviewAssignmentResponse;
import br.com.ampere.dto.ReviewDecisionRequest;
import br.com.ampere.dto.ReviewDecisionResponse;
import br.com.ampere.service.ProjectReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Project review", description = "Atribuição e decisão da análise técnica")
@RestController
@RequestMapping("/projects/{projectId}")
public class ProjectReviewController {

  private final ProjectReviewService service;

  public ProjectReviewController(ProjectReviewService service) {
    this.service = service;
  }

  @PostMapping("/review")
  @Operation(operationId = "assignProjectReview", summary = "Atribui o projeto ao analista")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Análise atribuída"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Projeto assumido por outro analista")
  })
  public ApiResponse<ReviewAssignmentResponse> assign(@PathVariable Long projectId) {
    return ApiResponse.of(ReviewAssignmentResponse.from(service.assign(projectId)));
  }

  @PostMapping("/decision")
  @Operation(operationId = "decideProjectReview", summary = "Registra a decisão da análise")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Decisão registrada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "422",
        description = "Decisão incompatível com os apontamentos")
  })
  public ApiResponse<ReviewDecisionResponse> decide(
      @PathVariable Long projectId, @Valid @RequestBody ReviewDecisionRequest request) {
    return ApiResponse.of(ReviewDecisionResponse.from(service.decide(projectId, request)));
  }
}
