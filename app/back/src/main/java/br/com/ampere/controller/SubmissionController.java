package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.ProjectDetailResponse;
import br.com.ampere.dto.SubmissionChecklistResponse;
import br.com.ampere.service.MemorialPdfService;
import br.com.ampere.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints do fluxo de submissao do projeto: memorial, checklist e envio.
 *
 * <p>Tres endpoints:
 *
 * <ul>
 *   <li>GET /memorial — gera e retorna o PDF do memorial de calculo
 *   <li>GET /submission — retorna o checklist de pre-submissao e se o projeto pode ser enviado
 *   <li>POST /submit — envia o projeto para revisao (muda status para UNDER_REVIEW)
 * </ul>
 */
@Tag(name = "Submission", description = "Memorial de cálculo, checklist e envio do projeto")
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

  /**
   * Gera e retorna o PDF do memorial de calculo.
   *
   * <p>O memorial contem: identificacao do projeto, unidades consumidoras, memoria de calculo
   * (passos e formulas), demanda total e normas aplicadas.
   *
   * <p>O PDF e gerado sob demanda (nao e armazenado) a partir do ultimo calculo feito para o
   * projeto.
   *
   * <p>Retorna o arquivo com Content-Type application/pdf e um header Content-Disposition para o
   * browser tratar como download.
   */
  @GetMapping("/memorial")
  @Operation(
      operationId = "generateMemorial",
      summary = "Gera o PDF do memorial de cálculo do projeto")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "PDF do memorial gerado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado ou sem cálculo")
  })
  public ResponseEntity<byte[]> memorial(@PathVariable Long projectId) {
    // Gera o PDF em memoria.
    byte[] pdfBytes = memorialPdfService.generate(projectId);

    // Monta a resposta HTTP com os headers corretos para download de PDF.
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=\"memorial-projeto-" + projectId + ".pdf\"")
        .body(pdfBytes);
  }

  /**
   * Retorna o checklist de pre-submissao.
   *
   * <p>Cada item do checklist indica se um requisito foi atendido (calculo realizado, ART anexada,
   * diagrama unifilar anexado, planta de situacao anexada). O campo canSubmit so e true quando
   * todos os itens estao completos.
   *
   * <p>O front usa este endpoint para decidir se habilita ou desabilita o botao de enviar.
   */
  @GetMapping("/submission")
  @Operation(
      operationId = "getSubmissionChecklist",
      summary = "Checklist de pré-submissão e flag canSubmit")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Checklist retornado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado")
  })
  public ApiResponse<SubmissionChecklistResponse> submission(@PathVariable Long projectId) {
    return ApiResponse.of(submissionService.checklist(projectId));
  }

  /**
   * Submete o projeto para revisao.
   *
   * <p>Verifica que todos os itens do checklist estao completos. Se estiverem, muda o status para
   * UNDER_REVIEW e grava a data de envio (submittedAt). Se faltar algo, retorna 422 com a lista das
   * pendencias.
   *
   * <p>A data de envio (submittedAt) tambem e usada pela US06 para calculo de SLA.
   */
  @PostMapping("/submit")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      operationId = "submitProject",
      summary = "Envia o projeto para revisão (status → UNDER_REVIEW)")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Projeto submetido com sucesso"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "Projeto não encontrado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "409",
        description = "Projeto não está em estado válido para submissão"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "422",
        description = "Documentos obrigatórios faltando")
  })
  public ApiResponse<ProjectDetailResponse> submit(@PathVariable Long projectId) {
    return ApiResponse.of(ProjectDetailResponse.from(submissionService.submit(projectId)));
  }
}
