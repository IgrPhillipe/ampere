package br.com.ampere.security;

import br.com.ampere.domain.User;
import java.time.Instant;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

  /** Issuer written into the token, so the decoder refuses a token from elsewhere. */
  public static final String ISSUER = "ampere-api";

  private final JwtEncoder encoder;
  private final JwtProperties properties;

  public TokenService(JwtEncoder encoder, JwtProperties properties) {
    this.encoder = encoder;
    this.properties = properties;
  }

  /** The {@code subject} is the user id, not the e-mail: e-mail changes, id does not. */
  public String issue(User user) {
    Instant now = Instant.now();

    JwtClaimsSet claims =
        JwtClaimsSet.builder()
            .issuer(ISSUER)
            .subject(String.valueOf(user.getId()))
            .issuedAt(now)
            .expiresAt(now.plus(properties.expiration()))
            .claim("email", user.getEmail())
            .claim("role", user.getRole().getValue())
            .build();

    return encoder
        .encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
        .getTokenValue();
  }
}
