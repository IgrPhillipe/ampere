package br.com.ampere.controller;

import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.PageQuery;
import br.com.ampere.dto.Pagination;
import br.com.ampere.dto.ProjectDetailResponse;
import br.com.ampere.dto.ProjectRequest;
import br.com.ampere.dto.ProjectResponse;
import br.com.ampere.dto.ProjectStatusCounts;
import br.com.ampere.service.ProjectListing;
import br.com.ampere.service.ProjectParameters;
import br.com.ampere.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
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

/** HTTP endpoints for electrical projects. */
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
        description = "Paginação ou situação inválida")
  })
  public ApiResponse<List<ProjectResponse>> list(
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
        projects,
        new Pagination(listing.totalElements(), pagination.page(), pagination.pageSize()));
  }

  /**
   * Totais por situação, para a barra de filtros.
   *
   * <p>Endpoint separado porque os contadores são globais e não mudam ao paginar nem ao buscar —
   * juntá-los à listagem obrigaria a recalcular a agregação a cada tecla digitada, e fazia dois
   * campos chamados {@code total} conviverem na mesma resposta com significados diferentes.
   */
  @GetMapping("/status-counts")
  @Operation(
      operationId = "countProjectsPerStatus",
      summary = "Total de projetos em cada situação, sem filtro")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Contadores por situação")
  })
  public ApiResponse<ProjectStatusCounts> statusCounts() {
    return ApiResponse.of(ProjectStatusCounts.from(service.countPerStatus()));
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
        responseCode = "409",
        description = "Não foi possível gerar o protocolo")
  })
  public ApiResponse<ProjectDetailResponse> create(@Valid @RequestBody ProjectRequest request) {
    return ApiResponse.of(ProjectDetailResponse.from(service.create(parametersOf(request))));
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
  public ApiResponse<ProjectDetailResponse> detail(@PathVariable Long id) {
    return ApiResponse.of(ProjectDetailResponse.from(service.findById(id)));
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
        responseCode = "404",
        description = "Projeto não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "O projeto não está mais em rascunho")
  })
  public ApiResponse<ProjectDetailResponse> update(
      @PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
    return ApiResponse.of(ProjectDetailResponse.from(service.update(id, parametersOf(request))));
  }

  /**
   * Sem envelope: 204 não tem corpo, e embrulhar obrigaria a responder 200 com {@code data} nulo.
   */
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(operationId = "deleteProject", summary = "Exclui um projeto em rascunho")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "204",
        description = "Projeto excluído"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "O projeto não está mais em rascunho")
  })
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }

  private static ProjectParameters parametersOf(ProjectRequest request) {
    return new ProjectParameters(
        request.name(),
        request.address(),
        request.municipality(),
        request.buildingType(),
        request.floors(),
        request.voltage(),
        request.connectionType(),
        request.entranceStandard());
  }
}
