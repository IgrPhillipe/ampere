package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.ProjectDetailResponse;
import br.com.ampere.dto.SubmissionChecklistResponse;
import br.com.ampere.service.MemorialPdfService;
import br.com.ampere.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Submission", description = "Memorial de cálculo, checagem e envio do projeto")
@RestController
@RequestMapping("/projects/{projectId}")
public class SubmissionController {

  private final MemorialPdfService memorialPdfService;
  private final SubmissionService submissionService;

  public SubmissionController(
      MemorialPdfService memorialPdfService, SubmissionService submissionService) {
    this.memorialPdfService = memorialPdfService;
    this.submissionService = submissionService;
  }

  @GetMapping(value = "/memorial", produces = MediaType.APPLICATION_PDF_VALUE)
  @Operation(
      operationId = "generateMemorial",
      summary = "Gera o PDF do memorial a partir do último cálculo do projeto")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "PDF do memorial"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado ou ainda sem cálculo")
  })
  public ResponseEntity<byte[]> memorial(@PathVariable Long projectId) {
    MemorialPdfService.Memorial memorial = memorialPdfService.generate(projectId);

    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.inline().filename(memorial.filename()).build().toString())
        .body(memorial.content());
  }

  @GetMapping("/submission")
  @Operation(
      operationId = "getSubmissionChecklist",
      summary = "Checagem antes do envio e se o projeto já pode ser enviado")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Itens da checagem"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado")
  })
  public ApiResponse<SubmissionChecklistResponse> submission(@PathVariable Long projectId) {
    return ApiResponse.of(SubmissionChecklistResponse.from(submissionService.checklist(projectId)));
  }

  @PostMapping("/submit")
  @Operation(operationId = "submitProject", summary = "Envia o projeto para análise")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Projeto enviado, com o status UNDER_REVIEW"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Projeto já enviado para análise"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "422",
        description = "Falta o cálculo ou algum documento obrigatório")
  })
  public ApiResponse<ProjectDetailResponse> submit(@PathVariable Long projectId) {
    return ApiResponse.of(ProjectDetailResponse.from(submissionService.submit(projectId)));
  }
}
