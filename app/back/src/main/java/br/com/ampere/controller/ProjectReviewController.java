package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.ReviewAssignmentResponse;
import br.com.ampere.dto.ReviewDecisionRequest;
import br.com.ampere.dto.ReviewDecisionResponse;
import br.com.ampere.service.AuthenticatedUser;
import br.com.ampere.service.ProjectReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
        responseCode = "403",
        description = "Apenas analista e administrador assumem a análise"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Projeto fora de análise, ou assumido por outro analista")
  })
  public ApiResponse<ReviewAssignmentResponse> assign(
      @PathVariable Long projectId, @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(ReviewAssignmentResponse.from(service.assign(projectId, userOf(jwt))));
  }

  @PostMapping("/decision")
  @Operation(operationId = "decideProjectReview", summary = "Registra a decisão da análise")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Decisão registrada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Decisão ou parecer ausente"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas o analista responsável decide"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "O projeto não está em análise"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "422",
        description = "Aprovação com bloqueante aberto, ou reprovação sem apontamento")
  })
  public ApiResponse<ReviewDecisionResponse> decide(
      @PathVariable Long projectId,
      @Valid @RequestBody ReviewDecisionRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        ReviewDecisionResponse.from(
            service.decide(projectId, request.decision(), request.opinion(), userOf(jwt))));
  }

  private static AuthenticatedUser userOf(Jwt jwt) {
    return AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role"));
  }
}
