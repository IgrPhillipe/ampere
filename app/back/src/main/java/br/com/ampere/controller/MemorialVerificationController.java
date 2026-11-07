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
    description = "Verificação pública da autenticidade do memorial")
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
          "Confere o código do rodapé do memorial e devolve protocolo, versão e data do envio")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Resultado da verificação; verified é falso se o código não existe")
  })
  public ApiResponse<MemorialVerificationResponse> byCode(@PathVariable String code) {
    return ApiResponse.of(
        service
            .byCode(code)
            .map(MemorialVerificationResponse::confirmed)
            .orElseGet(MemorialVerificationResponse::notConfirmed));
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      operationId = "verifyMemorialByFile",
      summary = "Confere se o PDF é idêntico ao memorial emitido no envio")
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Resultado da verificação; verified é falso se o arquivo foi alterado"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "Arquivo que não é PDF"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "413",
        description = "Arquivo acima de 10 MB")
  })
  public ApiResponse<MemorialVerificationResponse> byFile(
      @Parameter(description = "PDF do memorial") @RequestPart MultipartFile file)
      throws IOException {
    return ApiResponse.of(
        service
            .byFile(file.getBytes())
            .map(MemorialVerificationResponse::confirmed)
            .orElseGet(MemorialVerificationResponse::notConfirmed));
  }
}
