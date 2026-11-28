package br.com.ampere.controller;

import br.com.ampere.dto.ApiResponse;
import br.com.ampere.dto.MemorialVerificationResponse;
import br.com.ampere.service.MemorialVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(
    name = "Memorial verification",
    description = "Verificação pública da autenticidade do memorial e da planilha de cálculo")
@RestController
@RequestMapping("/memorial-verifications")
public class MemorialVerificationController {

  private final MemorialVerificationService service;

  public MemorialVerificationController(MemorialVerificationService service) {
    this.service = service;
  }

  @GetMapping("/{code}")
  @Operation(
      operationId = "verifyMemorialByCode",
      summary =
          "Confere o código do rodapé do memorial ou da aba Autenticidade da planilha e devolve"
              + " o tipo do documento, protocolo, versão, data de emissão e, no memorial da"
              + " aprovação com ressalvas, a data da aprovação")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Resultado da verificação; verified é falso se o código não existe")
  })
  public ApiResponse<MemorialVerificationResponse> byCode(@PathVariable String code) {
    return ApiResponse.of(MemorialVerificationResponse.of(service.byCode(code)));
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      operationId = "verifyMemorialByFile",
      summary =
          "Confere se o PDF ou o XLSX é idêntico ao emitido pelo AMPERE; no PDF, valida também a"
              + " assinatura digital")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description =
            "Resultado da verificação; verified é falso se o arquivo foi alterado ou se a"
                + " assinatura não é do AMPERE"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Arquivo que não é PDF nem XLSX"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "413",
        description = "Arquivo acima de 10 MB")
  })
  public ApiResponse<MemorialVerificationResponse> byFile(
      @Parameter(description = "PDF do memorial ou XLSX da planilha de cálculo") @RequestPart
          MultipartFile file)
      throws IOException {
    return ApiResponse.of(MemorialVerificationResponse.of(service.byFile(file.getBytes())));
  }
}
