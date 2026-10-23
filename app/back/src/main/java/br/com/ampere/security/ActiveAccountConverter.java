package br.com.ampere.security;

import br.com.ampere.repository.UserRepository;
import br.com.ampere.service.AuthService;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.stereotype.Component;

/**
 * Refuses the token of a deactivated account, or of one whose role the administrator changed. The
 * token itself stays valid until it expires, so the account is read back on every request.
 */
@Component
public class ActiveAccountConverter implements Converter<Jwt, AbstractAuthenticationToken> {

  private final JwtAuthenticationConverter delegate;
  private final UserRepository userRepository;

  public ActiveAccountConverter(
      JwtAuthenticationConverter delegate, UserRepository userRepository) {
    this.delegate = delegate;
    this.userRepository = userRepository;
  }

  @Override
  public AbstractAuthenticationToken convert(Jwt jwt) {
    Long userId = parseId(jwt.getSubject());
    if (userId != null) {
      userRepository
          .findStatusById(userId)
          .ifPresent(
              account -> {
                if (!account.isActive()) {
                  throw new DisabledException(AuthService.ACCOUNT_DISABLED);
                }

                // A demoted administrator must not keep the role until the token expires.
                if (!account.getRole().getValue().equalsIgnoreCase(jwt.getClaimAsString("role"))) {
                  throw new CredentialsExpiredException("O papel da conta mudou.");
                }
              });
    }

    return delegate.convert(jwt);
  }

  /** A malformed subject is left to {@code AuthenticatedUser}, which answers 401. */
  private static Long parseId(String subject) {
    try {
      return subject == null ? null : Long.valueOf(subject);
    } catch (NumberFormatException exception) {
      return null;
    }
  }
}
