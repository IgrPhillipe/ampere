package br.com.ampere.controller;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.DocumentResponse;
import br.com.ampere.service.ProjectDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Project documents", description = "Documentos em PDF exigidos para o envio do projeto")
@RestController
@RequestMapping("/projects/{projectId}/documents")
public class ProjectDocumentController {

  private final ProjectDocumentService service;

  public ProjectDocumentController(ProjectDocumentService service) {
    this.service = service;
  }

  @GetMapping
  @Operation(operationId = "listDocuments", summary = "Lista os documentos anexados ao projeto")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Documentos do projeto"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado")
  })
  public ApiResponse<List<DocumentResponse>> list(@PathVariable Long projectId) {
    return ApiResponse.of(
        service.listByProject(projectId).stream().map(DocumentResponse::from).toList());
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      operationId = "uploadDocument",
      summary = "Anexa um documento em PDF, substituindo o anterior do mesmo tipo")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "201",
        description = "Documento anexado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Arquivo que não é PDF, ou tipo ausente ou inválido"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Projeto já enviado para análise"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "413",
        description = "Arquivo acima de 10 MB")
  })
  public ApiResponse<DocumentResponse> upload(
      @PathVariable Long projectId,
      @Parameter(description = "Tipo do documento") @RequestParam DocumentType type,
      @Parameter(description = "Arquivo PDF") @RequestPart MultipartFile file)
      throws IOException {
    return ApiResponse.of(
        DocumentResponse.from(
            service.upload(projectId, type, file.getOriginalFilename(), file.getBytes())));
  }

  @DeleteMapping("/{documentId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(operationId = "deleteDocument", summary = "Remove um documento do projeto")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "204",
        description = "Documento removido"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto ou documento não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Projeto já enviado para análise")
  })
  public void delete(@PathVariable Long projectId, @PathVariable Long documentId) {
    service.delete(projectId, documentId);
  }
}
