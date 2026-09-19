package br.com.ampere.controller;

import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.PageQuery;
import br.com.ampere.dto.Pagination;
import br.com.ampere.dto.ProjectListResponse;
import br.com.ampere.dto.ProjectResponse;
import br.com.ampere.dto.ProjectStatusCounts;
import br.com.ampere.service.ProjectService;
import br.com.ampere.service.ProjectService.ProjectListing;
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

/** HTTP endpoints for electrical projects. */
@Tag(name = "Projects", description = "Listagem e acompanhamento de projetos elétricos")
@RestController
@RequestMapping("/projects")
public class ProjectController {

  private final ProjectService service;

  public ProjectController(ProjectService service) {
    this.service = service;
  }

  @GetMapping
  @Operation(operationId = "listProjects", summary = "Lista projetos com filtro, busca e paginação")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Página de projetos e contadores por situação"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Paginação ou situação inválida")
  })
  public ApiResponse<ProjectListResponse> list(
      @Valid @ParameterObject PageQuery pagination,
      @Parameter(description = "Situação usada para filtrar os projetos")
          @RequestParam(required = false)
          ProjectStatus status,
      @Parameter(description = "Termo buscado no nome ou no protocolo")
          @RequestParam(required = false)
          String search) {
    ProjectListing listing = service.list(pagination.page(), pagination.pageSize(), status, search);
    List<ProjectResponse> projects =
        listing.projects().stream()
            .map(project -> ProjectResponse.from(project, listing.pendingCountFor(project)))
            .toList();

    return ApiResponse.of(
        new ProjectListResponse(projects, ProjectStatusCounts.from(listing.statusCounts())),
        new Pagination(listing.totalElements(), pagination.page(), pagination.pageSize()));
  }
}
