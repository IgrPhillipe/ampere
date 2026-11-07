package br.com.ampere.dto;

import br.com.ampere.domain.ProjectVersion;
import java.time.OffsetDateTime;

public record MemorialVerificationResponse(
    boolean verified, String protocol, Integer version, OffsetDateTime submittedAt) {

  public static MemorialVerificationResponse confirmed(ProjectVersion version) {
    return new MemorialVerificationResponse(
        true, version.getProject().getProtocol(), version.getNumber(), version.getSubmittedAt());
  }

  public static MemorialVerificationResponse notConfirmed() {
    return new MemorialVerificationResponse(false, null, null, null);
  }
}
