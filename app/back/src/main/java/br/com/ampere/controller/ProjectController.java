package br.com.ampere.controller;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.OpenFindingsFilter;
import br.com.ampere.domain.ProjectSort;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.PageQuery;
import br.com.ampere.dto.Pagination;
import br.com.ampere.dto.ProjectDetailResponse;
import br.com.ampere.dto.ProjectRequest;
import br.com.ampere.dto.ProjectResponse;
import br.com.ampere.dto.ProjectStatusCounts;
import br.com.ampere.service.AuthenticatedUser;
import br.com.ampere.service.ProjectListQuery;
import br.com.ampere.service.ProjectListing;
import br.com.ampere.service.ProjectParameters;
import br.com.ampere.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.format.annotation.DateTimeFormat;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Projects", description = "Cadastro e acompanhamento de projetos elétricos")
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
        description = "Página de projetos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Parâmetros inválidos")
  })
  public ApiResponse<List<ProjectResponse>> list(
      @Valid @ParameterObject PageQuery pagination,
      @Parameter(description = "Situação usada para filtrar os projetos")
          @RequestParam(required = false)
          ProjectStatus status,
      @Parameter(description = "Termo buscado no nome ou no protocolo")
          @RequestParam(required = false)
          String search,
      @Parameter(description = "Coluna usada na ordenação (name, demand, createdAt, updatedAt)")
          @RequestParam(defaultValue = "updatedAt")
          ProjectSort sort,
      @Parameter(description = "Direção da ordenação (ASC, DESC)")
          @RequestParam(defaultValue = "DESC")
          SortDirection direction,
      @Parameter(description = "UFs usadas para filtrar os projetos; repita o parâmetro")
          @RequestParam(name = "state", required = false)
          List<BrazilianState> states,
      @Parameter(description = "Municípios usados para filtrar os projetos; repita o parâmetro")
          @RequestParam(name = "municipality", required = false)
          List<String> municipalities,
      @Parameter(description = "Data inicial de criação (inclusive), no formato YYYY-MM-DD")
          @RequestParam(required = false)
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate createdFrom,
      @Parameter(description = "Data final de criação (inclusive), no formato YYYY-MM-DD")
          @RequestParam(required = false)
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate createdTo,
      @Parameter(description = "Situações dos apontamentos em aberto; repita o parâmetro")
          @RequestParam(required = false)
          List<OpenFindingsFilter> findings,
      @AuthenticationPrincipal Jwt jwt) {
    ProjectListing listing =
        service.list(
            pagination.page(),
            pagination.pageSize(),
            new ProjectListQuery(
                status,
                search,
                sort,
                direction,
                states == null ? null : Set.copyOf(states),
                municipalities == null ? null : Set.copyOf(municipalities),
                createdFrom,
                createdTo,
                findings == null ? null : Set.copyOf(findings)),
            userOf(jwt));
    List<ProjectResponse> projects =
        listing.projects().stream()
            .map(
                project ->
                    ProjectResponse.from(
                        project,
                        listing.pendingCountFor(project),
                        listing.unitCountFor(project),
                        listing.demandFor(project)))
            .toList();

    return ApiResponse.of(
        projects,
        new Pagination(listing.totalElements(), pagination.page(), pagination.pageSize()));
  }

  @GetMapping("/status-counts")
  @Operation(
      operationId = "countProjectsPerStatus",
      summary = "Total de projetos em cada situação, sem filtro")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Contadores por situação")
  })
  public ApiResponse<ProjectStatusCounts> statusCounts(@AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(ProjectStatusCounts.from(service.countPerStatus(userOf(jwt))));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      operationId = "createProject",
      summary = "Cria um projeto em rascunho e atribui as normas aplicáveis")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "201",
        description = "Projeto criado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Dados da edificação inválidos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "O perfil analista não altera projetos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Não foi possível gerar o protocolo")
  })
  public ApiResponse<ProjectDetailResponse> create(
      @Valid @RequestBody ProjectRequest request, @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        ProjectDetailResponse.from(service.create(parametersOf(request), userOf(jwt))));
  }

  @GetMapping("/{id}")
  @Operation(operationId = "getProject", summary = "Detalha um projeto e as normas aplicadas")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Projeto encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Identificador inválido"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado")
  })
  public ApiResponse<ProjectDetailResponse> detail(
      @PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(ProjectDetailResponse.from(service.findById(id, userOf(jwt))));
  }

  @PutMapping("/{id}")
  @Operation(operationId = "updateProject", summary = "Atualiza um projeto em rascunho")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Projeto atualizado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Dados da edificação inválidos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "O perfil analista não altera projetos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "O projeto não está mais em rascunho")
  })
  public ApiResponse<ProjectDetailResponse> update(
      @PathVariable Long id,
      @Valid @RequestBody ProjectRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        ProjectDetailResponse.from(service.update(id, parametersOf(request), userOf(jwt))));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(operationId = "deleteProject", summary = "Exclui um projeto em rascunho")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "204",
        description = "Projeto excluído"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "O perfil analista não altera projetos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "O projeto não está mais em rascunho")
  })
  public void delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
    service.delete(id, userOf(jwt));
  }

  private static ProjectParameters parametersOf(ProjectRequest request) {
    return new ProjectParameters(
        request.name(),
        request.postalCode(),
        request.state(),
        request.municipality(),
        request.address(),
        request.buildingType(),
        request.floors(),
        request.voltage(),
        request.connectionType(),
        request.entranceStandard());
  }

  private static AuthenticatedUser userOf(Jwt jwt) {
    return AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role"));
  }
}
