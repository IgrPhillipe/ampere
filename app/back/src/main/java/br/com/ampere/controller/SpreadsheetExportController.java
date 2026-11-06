package br.com.ampere.controller;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.OpenFindingsFilter;
import br.com.ampere.domain.ProjectSort;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ReviewQueueFilter;
import br.com.ampere.domain.ReviewQueueSort;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.service.AuthenticatedUser;
import br.com.ampere.service.ProjectListQuery;
import br.com.ampere.service.ReviewQueueQuery;
import br.com.ampere.service.SpreadsheetExportService;
import br.com.ampere.service.SpreadsheetExportService.Download;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Spreadsheet exports", description = "Exportação de projetos, fila e cálculo")
@RestController
public class SpreadsheetExportController {

  private final SpreadsheetExportService service;

  public SpreadsheetExportController(SpreadsheetExportService service) {
    this.service = service;
  }

  @GetMapping(value = "/projects/{projectId}/calculation.xlsx", produces = XLSX_MEDIA_TYPE)
  @Operation(
      operationId = "exportProjectCalculation",
      summary = "Exporta o último cálculo do projeto em uma planilha Excel")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Planilha Excel com identificação, grupos e etapas do cálculo"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado ou ainda sem cálculo")
  })
  public ResponseEntity<byte[]> calculation(
      @PathVariable Long projectId, @AuthenticationPrincipal Jwt jwt) {
    return download(service.calculation(projectId, userOf(jwt)));
  }

  @GetMapping(value = "/projects/export.csv", produces = "text/csv")
  @Operation(
      operationId = "exportProjects",
      summary = "Exporta todos os projetos visíveis que correspondem aos filtros")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Arquivo CSV sem paginação"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Parâmetros inválidos")
  })
  public ResponseEntity<byte[]> projects(
      @Parameter(description = "Situação usada para filtrar os projetos")
          @RequestParam(required = false)
          ProjectStatus status,
      @Parameter(description = "Termo buscado no nome ou no protocolo")
          @RequestParam(required = false)
          String search,
      @Parameter(
              description = "Coluna usada na ordenação (name, owner, demand, createdAt, updatedAt)")
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
      @Parameter(description = "Projetista dono dos projetos, pelo identificador")
          @RequestParam(required = false)
          Long owner,
      @AuthenticationPrincipal Jwt jwt) {
    ProjectListQuery query =
        new ProjectListQuery(
            status,
            search,
            sort,
            direction,
            states,
            municipalities,
            createdFrom,
            createdTo,
            findings,
            owner);
    return download(service.projects(query, userOf(jwt)));
  }

  @GetMapping(value = "/review-queue/export.csv", produces = "text/csv")
  @Operation(
      operationId = "exportReviewQueue",
      summary = "Exporta todos os projetos da fila que correspondem aos filtros")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Arquivo CSV sem paginação"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Parâmetros inválidos"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "Apenas analista e administrador acessam a fila")
  })
  public ResponseEntity<byte[]> reviewQueue(
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
      @Parameter(description = "Projetista dono dos projetos, pelo identificador")
          @RequestParam(required = false)
          Long owner,
      @Parameter(description = "UFs usadas para filtrar os projetos; repita o parâmetro")
          @RequestParam(name = "state", required = false)
          List<BrazilianState> states,
      @Parameter(description = "Municípios usados para filtrar os projetos; repita o parâmetro")
          @RequestParam(name = "municipality", required = false)
          List<String> municipalities,
      @AuthenticationPrincipal Jwt jwt) {
    ReviewQueueQuery query =
        new ReviewQueueQuery(
            search, filter, sort, direction, reviewer, owner, states, municipalities);
    return download(service.reviewQueue(query, userOf(jwt)));
  }

  private static ResponseEntity<byte[]> download(Download download) {
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(download.contentType()))
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment().filename(download.filename()).build().toString())
        .body(download.content());
  }

  private static AuthenticatedUser userOf(Jwt jwt) {
    return AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role"));
  }

  private static final String XLSX_MEDIA_TYPE =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
}
