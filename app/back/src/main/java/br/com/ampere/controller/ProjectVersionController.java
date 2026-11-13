package br.com.ampere.controller;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.ProjectVersionDocument;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.ProjectVersionResponse;
import br.com.ampere.dto.VersionComparisonResponse;
import br.com.ampere.service.AuthenticatedUser;
import br.com.ampere.service.MemorialPdfService;
import br.com.ampere.service.ProjectVersionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Project versions", description = "Versões imutáveis de cada envio do projeto")
@RestController
@RequestMapping("/projects/{projectId}/versions")
public class ProjectVersionController {

  private final ProjectVersionService service;

  public ProjectVersionController(ProjectVersionService service) {
    this.service = service;
  }

  @GetMapping
  @Operation(operationId = "listProjectVersions", summary = "Lista as versões enviadas do projeto")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Versões, da primeira para a última"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado ou não visível")
  })
  public ApiResponse<List<ProjectVersionResponse>> list(
      @PathVariable Long projectId, @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        service.list(projectId, userOf(jwt)).stream().map(ProjectVersionResponse::from).toList());
  }

  @GetMapping(value = "/{number}/memorial", produces = MediaType.APPLICATION_PDF_VALUE)
  @Operation(
      operationId = "getVersionMemorial",
      summary = "Devolve o PDF do memorial gravado na versão, sem regerar")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "PDF do memorial da versão"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto ou versão não encontrados")
  })
  public ResponseEntity<byte[]> memorial(
      @PathVariable Long projectId, @PathVariable int number, @AuthenticationPrincipal Jwt jwt) {
    MemorialPdfService.Memorial memorial = service.memorial(projectId, number, userOf(jwt));

    return InlinePdf.of(memorial.filename(), memorial.content());
  }

  @GetMapping(value = "/{number}/approval-memorial", produces = MediaType.APPLICATION_PDF_VALUE)
  @Operation(
      operationId = "getVersionApprovalMemorial",
      summary = "Devolve o PDF do memorial emitido na aprovação com ressalvas da versão")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "PDF do memorial da aprovação"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto ou versão não encontrados, ou versão sem aprovação com ressalvas")
  })
  public ResponseEntity<byte[]> approvalMemorial(
      @PathVariable Long projectId, @PathVariable int number, @AuthenticationPrincipal Jwt jwt) {
    MemorialPdfService.Memorial memorial = service.approvalMemorial(projectId, number, userOf(jwt));

    return InlinePdf.of(memorial.filename(), memorial.content());
  }

  @GetMapping(value = "/{number}/documents/{type}/file", produces = MediaType.APPLICATION_PDF_VALUE)
  @Operation(
      operationId = "getVersionDocument",
      summary = "Devolve o PDF do documento como foi enviado nesta versão")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Conteúdo do PDF"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Tipo de documento inválido"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto, versão ou documento não encontrados")
  })
  public ResponseEntity<byte[]> document(
      @PathVariable Long projectId,
      @PathVariable int number,
      @PathVariable DocumentType type,
      @AuthenticationPrincipal Jwt jwt) {
    ProjectVersionDocument document = service.document(projectId, number, type, userOf(jwt));

    return InlinePdf.of(document.getFilename(), document.getData());
  }

  @GetMapping("/compare")
  @Operation(
      operationId = "compareProjectVersions",
      summary =
          "Compara duas versões: grupos incluídos, removidos e alterados, e a demanda de cada")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Diferenças entre as versões"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Número de versão ausente ou inválido, ou origem posterior ao destino"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto ou versão não encontrados")
  })
  public ApiResponse<VersionComparisonResponse> compare(
      @PathVariable Long projectId,
      @Parameter(description = "Número da versão de origem") @RequestParam int from,
      @Parameter(description = "Número da versão de destino") @RequestParam int to,
      @AuthenticationPrincipal Jwt jwt) {
    return ApiResponse.of(
        VersionComparisonResponse.from(service.compare(projectId, from, to, userOf(jwt))));
  }

  private static AuthenticatedUser userOf(Jwt jwt) {
    return AuthenticatedUser.of(jwt.getSubject(), jwt.getClaimAsString("role"));
  }
}
