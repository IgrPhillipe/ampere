package br.com.ampere.controller;

import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableComparison;
import br.com.ampere.domain.NormativeTableSort;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.NormativeTableCodeResponse;
import br.com.ampere.dto.NormativeTableComparisonResponse;
import br.com.ampere.dto.NormativeTablePublicationRequest;
import br.com.ampere.dto.NormativeTableRequest;
import br.com.ampere.dto.NormativeTableResponse;
import br.com.ampere.dto.NormativeTableRowRequest;
import br.com.ampere.service.AuthenticatedUser;
import br.com.ampere.service.NormativeTableHistoryService;
import br.com.ampere.service.NormativeTableParameters;
import br.com.ampere.service.NormativeTableQuery;
import br.com.ampere.service.NormativeTableService;
import br.com.ampere.service.PersonDirectory;
import br.com.ampere.service.PersonNames;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Collection;
import java.util.List;
import java.util.stream.Stream;
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

@Tag(
    name = "Normative tables",
    description =
        "Cadastro e publicação das tabelas normativas lidas pelo cálculo (revisor e admin)")
@RestController
@RequestMapping("/normative-tables")
public class NormativeTableController {

  private final NormativeTableService service;
  private final NormativeTableHistoryService historyService;
  private final PersonDirectory people;

  public NormativeTableController(
      NormativeTableService service,
      NormativeTableHistoryService historyService,
      PersonDirectory people) {
    this.service = service;
    this.historyService = historyService;
    this.people = people;
  }

  @GetMapping("/codes")
  @Operation(
      operationId = "listNormativeTableCodes",
      summary = "Tabelas que o cálculo lê e o sentido de cada coluna")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Catálogo das tabelas")
  })
  public ApiResponse<List<NormativeTableCodeResponse>> codes() {
    return ApiResponse.of(NormativeTableCodeResponse.all());
  }

  @GetMapping
  @Operation(
      operationId = "listNormativeTables",
      summary = "Lista as tabelas cadastradas, filtradas e ordenadas")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Tabelas cadastradas, sem as linhas"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Parâmetros inválidos")
  })
  public ApiResponse<List<NormativeTableResponse>> list(
      @Parameter(description = "Termo buscado na identificação, no título, no item ou na norma")
          @RequestParam(required = false)
          String search,
      @Parameter(description = "Situações usadas para filtrar as tabelas; repita o parâmetro")
          @RequestParam(name = "status", required = false)
          List<NormativeTableStatus> statuses,
      @Parameter(description = "Coluna usada na ordenação (code, registeredAt, verifiedAt)")
          @RequestParam(defaultValue = "code")
          NormativeTableSort sort,
      @Parameter(description = "Direção da ordenação (ASC, DESC)")
          @RequestParam(defaultValue = "ASC")
          SortDirection direction,
      @AuthenticationPrincipal Jwt jwt) {
    NormativeTableQuery query = new NormativeTableQuery(search, statuses, sort, direction);

    return ApiResponse.of(summaries(service.list(query, userOf(jwt))));
  }

  @GetMapping("/{id}")
  @Operation(operationId = "getNormativeTable", summary = "Detalha uma tabela com as linhas")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Tabela encontrada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Tabela não encontrada")
  })
  public ApiResponse<NormativeTableResponse> detail(
      @PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(detailOf(service.findById(id, userOf(jwt))));
  }

  @GetMapping("/{id}/revisions")
  @Operation(
      operationId = "listNormativeTableRevisions",
      summary = "Histórico das revisões da mesma tabela, da mais recente à mais antiga")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Revisões cadastradas, sem as linhas"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Tabela não encontrada")
  })
  public ApiResponse<List<NormativeTableResponse>> revisions(
      @PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(summaries(historyService.revisions(id, userOf(jwt))));
  }

  @GetMapping("/{id}/revisions/compare")
  @Operation(
      operationId = "compareNormativeTableRevisions",
      summary = "Compara duas revisões: linhas incluídas, removidas e alteradas")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Diferenças entre as revisões"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Revisão ausente, ou origem posterior ao destino"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Tabela não encontrada, ou revisão fora do histórico dela")
  })
  public ApiResponse<NormativeTableComparisonResponse> compare(
      @PathVariable Long id,
      @Parameter(description = "Identificador da revisão de origem, a mais antiga") @RequestParam
          Long from,
      @Parameter(description = "Identificador da revisão de destino") @RequestParam Long to,
      @AuthenticationPrincipal Jwt jwt) {
    NormativeTableComparison comparison = historyService.compare(id, from, to, userOf(jwt));

    return ApiResponse.of(
        NormativeTableComparisonResponse.from(
            comparison, namesOf(List.of(comparison.from(), comparison.to()))));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(operationId = "createNormativeTable", summary = "Cadastra uma tabela em rascunho")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "201",
        description = "Tabela cadastrada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Linhas inválidas")
  })
  public ApiResponse<NormativeTableResponse> create(
      @Valid @RequestBody NormativeTableRequest request, @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        detailOf(service.create(parametersOf(request), emailOf(jwt), userOf(jwt))));
  }

  @PutMapping("/{id}")
  @Operation(operationId = "updateNormativeTable", summary = "Atualiza uma tabela em rascunho")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Tabela atualizada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Linhas inválidas"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "A revisão foi cadastrada por outra pessoa"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Tabela não encontrada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "A tabela já foi publicada")
  })
  public ApiResponse<NormativeTableResponse> update(
      @PathVariable Long id,
      @Valid @RequestBody NormativeTableRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        detailOf(service.update(id, parametersOf(request), emailOf(jwt), userOf(jwt))));
  }

  @PostMapping("/{id}/publication")
  @Operation(
      operationId = "publishNormativeTable",
      summary = "Publica a tabela conferida por outra pessoa e substitui a publicada")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Tabela publicada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Tabela não encontrada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Já publicada, conferida por quem cadastrou ou alterada depois de lida")
  })
  public ApiResponse<NormativeTableResponse> publish(
      @PathVariable Long id,
      @Valid @RequestBody NormativeTablePublicationRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        detailOf(service.publish(id, request.version(), emailOf(jwt), userOf(jwt))));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(operationId = "deleteNormativeTable", summary = "Exclui uma tabela em rascunho")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "204",
        description = "Tabela excluída"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "A revisão foi cadastrada por outra pessoa, e quem exclui não é gestor"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Tabela não encontrada"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "A tabela já foi publicada")
  })
  public void delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
    service.delete(id, emailOf(jwt), userOf(jwt));
  }

  private List<NormativeTableResponse> summaries(List<NormativeTable> tables) {
    PersonNames names = namesOf(tables);

    return tables.stream().map(table -> NormativeTableResponse.summary(table, names)).toList();
  }

  private NormativeTableResponse detailOf(NormativeTable table) {
    return NormativeTableResponse.from(table, namesOf(List.of(table)));
  }

  private PersonNames namesOf(Collection<NormativeTable> tables) {
    return people.namesOf(
        tables.stream()
            .flatMap(table -> Stream.of(table.getRegisteredBy(), table.getVerifiedBy()))
            .toList());
  }

  private static NormativeTableParameters parametersOf(NormativeTableRequest request) {
    return new NormativeTableParameters(
        request.code(),
        request.identification().trim(),
        request.item().trim(),
        request.page().trim(),
        request.rows().stream().map(NormativeTableRowRequest::toRow).toList());
  }

  private static String emailOf(Jwt jwt) {
    return jwt.getClaimAsString("email");
  }

  private static AuthenticatedUser userOf(Jwt jwt) {
    return AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role"));
  }
}
