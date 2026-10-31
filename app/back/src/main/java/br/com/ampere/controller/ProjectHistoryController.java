package br.com.ampere.controller;

import br.com.ampere.domain.SortDirection;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.ProjectEventResponse;
import br.com.ampere.dto.ProjectReworkResponse;
import br.com.ampere.service.AuthenticatedUser;
import br.com.ampere.service.ProjectHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Project history", description = "Histórico e retrabalho do protocolo")
@RestController
@RequestMapping("/projects/{projectId}")
public class ProjectHistoryController {

  private final ProjectHistoryService service;

  public ProjectHistoryController(ProjectHistoryService service) {
    this.service = service;
  }

  @GetMapping("/events")
  @Operation(
      operationId = "listProjectEvents",
      summary = "Lista o histórico do projeto na ordem solicitada")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Histórico do projeto"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Direção inválida"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado ou não visível")
  })
  public ApiResponse<List<ProjectEventResponse>> events(
      @PathVariable Long projectId,
      @Parameter(description = "Direção da linha do tempo (ASC, DESC)")
          @RequestParam(defaultValue = "DESC")
          SortDirection direction,
      @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        service.events(projectId, direction, userOf(jwt)).stream()
            .map(ProjectEventResponse::from)
            .toList());
  }

  @GetMapping("/rework")
  @Operation(operationId = "getProjectRework", summary = "Calcula as métricas de retrabalho")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Métricas de retrabalho do projeto"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado ou não visível")
  })
  public ApiResponse<ProjectReworkResponse> rework(
      @PathVariable Long projectId, @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(ProjectReworkResponse.from(service.rework(projectId, userOf(jwt))));
  }

  private static AuthenticatedUser userOf(Jwt jwt) {
    return AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role"));
  }
}
