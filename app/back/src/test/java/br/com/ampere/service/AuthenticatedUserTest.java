package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.ampere.domain.UserRole;
import br.com.ampere.error.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class AuthenticatedUserTest {

  @Test
  void readsTheIdAndTheRoleFromTheToken() {
    assertThat(AuthenticatedUser.of("7", "admin"))
        .isEqualTo(new AuthenticatedUser(7L, UserRole.ADMIN));
  }

  @Test
  void answersUnauthorizedForATokenWithoutAValidIdentity() {
    assertThatThrownBy(() -> AuthenticatedUser.of("joao@ampere.com", "user"))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Sessão inválida. Entre novamente.")
        .extracting(exception -> ((BusinessException) exception).getStatus())
        .isEqualTo(HttpStatus.UNAUTHORIZED);
    assertThatThrownBy(() -> AuthenticatedUser.of("7", null))
        .isInstanceOf(BusinessException.class)
        .extracting(exception -> ((BusinessException) exception).getStatus())
        .isEqualTo(HttpStatus.UNAUTHORIZED);
  }
}
