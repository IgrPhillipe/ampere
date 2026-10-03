package br.com.ampere.controller;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.DocumentResponse;
import br.com.ampere.service.ProjectDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Endpoints para gerenciar os documentos PDF anexados a um projeto.
 *
 * <p>Cada projeto precisa de tres documentos para ser submetido: ART, diagrama unifilar e planta de
 * situacao. Este controller permite fazer upload (POST), listar (GET) e remover (DELETE) esses
 * documentos.
 *
 * <p>O upload aceita apenas arquivos PDF. Cada tipo de documento so pode ter um por projeto — se ja
 * existir, o anterior e substituido.
 */
@Tag(
    name = "Project documents",
    description = "Documentos PDF anexados ao projeto (ART, diagramas)")
@RestController
@RequestMapping("/projects/{projectId}/documents")
public class ProjectDocumentController {

  private final ProjectDocumentService service;

  public ProjectDocumentController(ProjectDocumentService service) {
    this.service = service;
  }

  /**
   * Lista todos os documentos de um projeto.
   *
   * <p>Retorna apenas os metadados (tipo, nome, tamanho), sem o conteudo binario.
   */
  @GetMapping
  @Operation(operationId = "listDocuments", summary = "Lista os documentos anexados ao projeto")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Documentos listados"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado")
  })
  public ApiResponse<List<DocumentResponse>> list(@PathVariable Long projectId) {
    return ApiResponse.of(
        service.listByProject(projectId).stream().map(DocumentResponse::from).toList());
  }

  /**
   * Faz upload de um documento PDF.
   *
   * <p>O tipo do documento e informado como parametro (ART, DIAGRAMA_UNIFILAR ou
   * PLANTA_DE_SITUACAO). Se ja existir um documento do mesmo tipo, ele e substituido.
   *
   * <p>O endpoint aceita multipart/form-data com dois campos:
   *
   * <ul>
   *   <li>type: o tipo do documento (enum DocumentType)
   *   <li>file: o arquivo PDF
   * </ul>
   */
  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(operationId = "uploadDocument", summary = "Envia um documento PDF ao projeto")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "201",
        description = "Documento enviado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Arquivo inválido ou tipo não informado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Projeto já foi submetido")
  })
  public ApiResponse<DocumentResponse> upload(
      @PathVariable Long projectId,
      @Parameter(description = "Tipo do documento: ART, DIAGRAMA_UNIFILAR ou PLANTA_DE_SITUACAO")
          @RequestParam
          DocumentType type,
      @Parameter(description = "Arquivo PDF") @RequestParam("file") MultipartFile file) {
    return ApiResponse.of(DocumentResponse.from(service.upload(projectId, type, file)));
  }

  /**
   * Remove um documento pelo ID.
   *
   * <p>So e possivel remover documentos de projetos que ainda nao foram submetidos.
   */
  @DeleteMapping("/{documentId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(operationId = "deleteDocument", summary = "Remove um documento do projeto")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "204",
        description = "Documento removido"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Documento ou projeto não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Projeto já foi submetido")
  })
  public void delete(@PathVariable Long projectId, @PathVariable Long documentId) {
    service.delete(projectId, documentId);
  }
}
