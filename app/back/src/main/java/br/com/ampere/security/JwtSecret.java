package br.com.ampere.security;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Resolve a chave que assina o token.
 *
 * <p>Nao ha segredo versionado no repositorio: um segredo que esta no codigo nao protege ninguem,
 * porque quem le o codigo assina um token valido. Em troca, quem nao define {@code JWT_SECRET} fora
 * de producao recebe uma chave aleatoria por execucao — a aplicacao sobe sem configuracao, e o
 * preco e que o token nao sobrevive a um reinicio.
 *
 * <p>Em producao, sem {@code JWT_SECRET} a aplicacao nao sobe. E melhor nao subir do que subir
 * assinando com uma chave que ninguem escolheu.
 */
public final class JwtSecret {

  private static final Logger log = LoggerFactory.getLogger(JwtSecret.class);

  /** HS256 assina com 256 bits. Menos que isto o Nimbus recusa, e com razao. */
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
