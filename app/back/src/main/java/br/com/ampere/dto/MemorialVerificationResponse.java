package br.com.ampere.dto;

import br.com.ampere.domain.IssuedDocumentType;
import br.com.ampere.domain.ProjectVersion;
import br.com.ampere.service.MemorialVerificationService;
import br.com.ampere.service.MemorialVerificationService.SignatureStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;

public record MemorialVerificationResponse(
    boolean verified,
    @Schema(description = "Tipo do documento; nulo quando não confere")
        IssuedDocumentType documentType,
    String protocol,
    @Schema(description = "Número da versão; nulo na planilha de um cálculo ainda não enviado")
        Integer version,
    OffsetDateTime submittedAt,
    @Schema(description = "Data da aprovação com ressalvas; nula nos demais documentos")
        OffsetDateTime approvedAt,
    @Schema(description = "Data em que o documento foi emitido") OffsetDateTime issuedAt,
    @Schema(
            description =
                "Assinatura do PDF enviado: VALID (íntegra, do AMPERE), INVALID (alterada),"
                    + " UNTRUSTED (de outro certificado) ou ABSENT (memorial anterior à"
                    + " assinatura). Nula na verificação por código e na planilha")
        SignatureStatus signature) {

  public static MemorialVerificationResponse of(MemorialVerificationService.Result result) {
    MemorialVerificationService.Verified verified = result.verified();
    if (verified == null) {
      return new MemorialVerificationResponse(
          false, null, null, null, null, null, null, result.signature());
    }
    ProjectVersion version = verified.version();

    return new MemorialVerificationResponse(
        true,
        verified.type(),
        verified.project().getProtocol(),
        version == null ? null : version.getNumber(),
        version == null ? null : version.getSubmittedAt(),
        verified.approvedAt(),
        verified.issuedAt(),
        result.signature());
  }
}
