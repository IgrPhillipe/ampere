package br.com.ampere.dto;

import br.com.ampere.service.TemporaryAccess;

/** The only response that carries the temporary password: the screen shows it once. */
public record TemporaryAccessResponse(ManagedUserResponse user, String temporaryPassword) {

  public static TemporaryAccessResponse from(TemporaryAccess access) {
    return new TemporaryAccessResponse(
        ManagedUserResponse.from(access.user()), access.temporaryPassword());
  }
}
