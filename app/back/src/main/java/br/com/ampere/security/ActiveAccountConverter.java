package br.com.ampere.security;

import br.com.ampere.repository.UserRepository;
import br.com.ampere.repository.UserRepository.AccountStatus;
import br.com.ampere.service.AuthService;
import java.util.ArrayList;
import java.util.List;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/** The token stays valid until it expires, so the account is read back on every request. */
@Component
public class ActiveAccountConverter implements Converter<Jwt, AbstractAuthenticationToken> {

  /** Granted while the account still signs in with a temporary password. */
  public static final String PASSWORD_CHANGE_PENDING = "PASSWORD_CHANGE_PENDING";

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
    if (userId == null) {
      return delegate.convert(jwt);
    }

    AccountStatus account =
        userRepository
            .findStatusById(userId)
            .orElseThrow(() -> new CredentialsExpiredException("Account no longer exists"));
    if (!account.isActive()) {
      throw new DisabledException(AuthService.ACCOUNT_DISABLED);
    }

    // A demoted administrator must not keep the role until the token expires.
    if (!account.getRole().getValue().equalsIgnoreCase(jwt.getClaimAsString("role"))) {
      throw new CredentialsExpiredException("Account role changed");
    }

    AbstractAuthenticationToken token = delegate.convert(jwt);
    if (!account.isMustChangePassword()) {
      return token;
    }

    List<GrantedAuthority> authorities = new ArrayList<>(token.getAuthorities());
    authorities.add(new SimpleGrantedAuthority(PASSWORD_CHANGE_PENDING));

    return new JwtAuthenticationToken(jwt, authorities, token.getName());
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
