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
  void onlyTheAnalystAndTheAdminReview() {
    AuthenticatedUser reviewer = AuthenticatedUser.of("7", "reviewer");

    assertThat(reviewer).isEqualTo(new AuthenticatedUser(7L, UserRole.REVIEWER));
    assertThat(reviewer.canReview()).isTrue();
    assertThat(reviewer.isAdmin()).isFalse();
    assertThat(AuthenticatedUser.of("7", "admin").canReview()).isTrue();
    assertThat(AuthenticatedUser.of("7", "user").canReview()).isFalse();
  }

  @Test
  void refusesTheRoleTheServiceRequires() {
    AuthenticatedUser designer = new AuthenticatedUser(7L, UserRole.USER);
    AuthenticatedUser reviewer = new AuthenticatedUser(8L, UserRole.REVIEWER);

    assertThatThrownBy(designer::requireReviewer)
        .isInstanceOf(BusinessException.class)
        .extracting(exception -> ((BusinessException) exception).getStatus())
        .isEqualTo(HttpStatus.FORBIDDEN);
    assertThatThrownBy(reviewer::requireAdmin)
        .isInstanceOf(BusinessException.class)
        .extracting(exception -> ((BusinessException) exception).getStatus())
        .isEqualTo(HttpStatus.FORBIDDEN);
    reviewer.requireReviewer();
    new AuthenticatedUser(9L, UserRole.ADMIN).requireAdmin();
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
