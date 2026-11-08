package br.com.ampere.dto;

import br.com.ampere.domain.ProjectVersion;
import br.com.ampere.service.MemorialVerificationService;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;

public record MemorialVerificationResponse(
    boolean verified,
    String protocol,
    Integer version,
    OffsetDateTime submittedAt,
    @Schema(description = "Data da aprovação com ressalvas; nula no memorial do envio")
        OffsetDateTime approvedAt) {

  public static MemorialVerificationResponse confirmed(
      MemorialVerificationService.Verified verified) {
    ProjectVersion version = verified.version();
    return new MemorialVerificationResponse(
        true,
        version.getProject().getProtocol(),
        version.getNumber(),
        version.getSubmittedAt(),
        verified.approvedAt());
  }

  public static MemorialVerificationResponse notConfirmed() {
    return new MemorialVerificationResponse(false, null, null, null, null);
  }
}
