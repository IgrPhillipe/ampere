package br.com.ampere.security;

import br.com.ampere.domain.User;
import java.time.Instant;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

/** Emite o JWT que o front guarda e devolve no header {@code Authorization}. */
@Service
public class TokenService {

  /** Emissor gravado no token, para o decodificador recusar token de outra origem. */
  public static final String ISSUER = "ampere-api";

  private final JwtEncoder encoder;
  private final JwtProperties properties;

  public TokenService(JwtEncoder encoder, JwtProperties properties) {
    this.encoder = encoder;
    this.properties = properties;
  }

  /**
   * O {@code subject} e o id do usuario, nao o e-mail: e-mail pode mudar, id nao. O papel viaja
   * como claim so para leitura; quem decide acesso continua consultando o banco.
   */
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
