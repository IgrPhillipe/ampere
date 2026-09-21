package br.com.ampere.security;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class JwtSecret {

  private static final Logger log = LoggerFactory.getLogger(JwtSecret.class);

  /** HS256 signs with 256 bits. Nimbus refuses anything shorter, and rightly so. */
  static final int MINIMUM_BYTES = 32;

  private static final String ALGORITHM = "HmacSHA256";

  private JwtSecret() {}

  public static SecretKey resolve(String configured, boolean isProduction) {
    if (configured == null || configured.isBlank()) {
      if (isProduction) {
        throw new IllegalStateException(
            "JWT_SECRET nao definida. Defina uma chave de pelo menos "
                + MINIMUM_BYTES
                + " caracteres no ambiente antes de subir em producao.");
      }

      log.warn(
          "JWT_SECRET nao definida: assinando com chave aleatoria desta execucao. "
              + "Todo token deixa de valer quando a aplicacao reiniciar.");

      return generate();
    }

    byte[] bytes = configured.getBytes(StandardCharsets.UTF_8);

    if (bytes.length < MINIMUM_BYTES) {
      throw new IllegalStateException(
          "JWT_SECRET tem "
              + bytes.length
              + " bytes; HS256 exige pelo menos "
              + MINIMUM_BYTES
              + ".");
    }

    return new SecretKeySpec(bytes, ALGORITHM);
  }

  private static SecretKey generate() {
    byte[] bytes = new byte[MINIMUM_BYTES];
    new SecureRandom().nextBytes(bytes);

    return new SecretKeySpec(
        Base64.getEncoder().encodeToString(bytes).getBytes(StandardCharsets.UTF_8), ALGORITHM);
  }
}
