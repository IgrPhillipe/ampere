package br.com.ampere.security;

import br.com.ampere.utils.MemorialFingerprint;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.cert.Certificate;
import java.security.cert.CertificateEncodingException;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x509.BasicConstraints;
import org.bouncycastle.asn1.x509.Extension;
import org.bouncycastle.asn1.x509.KeyUsage;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder;
import org.bouncycastle.operator.OperatorCreationException;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** The AMPERE key and certificate chain, the signer's certificate first. */
public record SigningCredentials(PrivateKey key, List<X509Certificate> chain) {

  private static final Logger log = LoggerFactory.getLogger(SigningCredentials.class);

  static final String DEVELOPMENT_SUBJECT = "CN=AMPERE (desenvolvimento), O=AMPERE, C=BR";

  public SigningCredentials {
    if (chain.isEmpty()) {
      throw new IllegalArgumentException("A cadeia de certificados está vazia.");
    }
    chain = List.copyOf(chain);
  }

  public X509Certificate certificate() {
    return chain.getFirst();
  }

  /** SHA-256 of the DER certificate, as recorded beside each signed document. */
  public String certificateSha256() {
    return fingerprint(certificate());
  }

  public static String fingerprint(X509Certificate certificate) {
    try {
      return MemorialFingerprint.sha256(certificate.getEncoded());
    } catch (CertificateEncodingException exception) {
      throw new IllegalStateException(exception);
    }
  }

  static byte[] digest(byte[] content) {
    try {
      return MessageDigest.getInstance("SHA-256").digest(content);
    } catch (NoSuchAlgorithmException impossible) {
      throw new IllegalStateException(impossible);
    }
  }

  public static SigningCredentials resolve(SigningProperties properties, boolean isProduction) {
    String keystore = properties == null ? null : properties.keystore();
    if (keystore == null || keystore.isBlank()) {
      if (isProduction) {
        throw new IllegalStateException(
            "SIGNING_KEYSTORE nao definida. Defina o PKCS12 do AMPERE em base64 antes de subir"
                + " em producao.");
      }
      log.warn(
          "SIGNING_KEYSTORE nao definida: assinando os documentos com um certificado efemero"
              + " desta execucao. Nao use em producao.");

      return selfSigned(DEVELOPMENT_SUBJECT);
    }

    return load(keystore, properties.password());
  }

  static SigningCredentials load(String base64, String password) {
    char[] secret = password == null ? new char[0] : password.toCharArray();
    try {
      KeyStore store = KeyStore.getInstance("PKCS12");
      store.load(new ByteArrayInputStream(Base64.getMimeDecoder().decode(base64.trim())), secret);
      for (String alias : Collections.list(store.aliases())) {
        if (store.isKeyEntry(alias)) {
          PrivateKey key = (PrivateKey) store.getKey(alias, secret);
          Certificate[] chain = store.getCertificateChain(alias);

          return new SigningCredentials(
              key, Arrays.stream(chain).map(X509Certificate.class::cast).toList());
        }
      }
      throw new IllegalStateException("SIGNING_KEYSTORE nao tem chave privada.");
    } catch (GeneralSecurityException | IOException | IllegalArgumentException exception) {
      throw new IllegalStateException(
          "SIGNING_KEYSTORE invalida ou senha errada: " + exception.getMessage(), exception);
    }
  }

  /** A fresh RSA key with a self-signed certificate, for development and tests. */
  public static SigningCredentials selfSigned(String subject) {
    try {
      KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
      generator.initialize(2048);
      KeyPair pair = generator.generateKeyPair();
      X500Name name = new X500Name(subject);
      Instant now = Instant.now();
      JcaX509v3CertificateBuilder builder =
          new JcaX509v3CertificateBuilder(
              name,
              BigInteger.valueOf(now.toEpochMilli()),
              Date.from(now.minus(Duration.ofDays(1))),
              Date.from(now.plus(Duration.ofDays(3650))),
              name,
              pair.getPublic());
      builder.addExtension(Extension.basicConstraints, true, new BasicConstraints(false));
      builder.addExtension(
          Extension.keyUsage,
          true,
          new KeyUsage(KeyUsage.digitalSignature | KeyUsage.nonRepudiation));
      X509Certificate certificate =
          new JcaX509CertificateConverter()
              .getCertificate(
                  builder.build(
                      new JcaContentSignerBuilder("SHA256withRSA").build(pair.getPrivate())));

      return new SigningCredentials(pair.getPrivate(), List.of(certificate));
    } catch (GeneralSecurityException | OperatorCreationException | IOException exception) {
      throw new IllegalStateException("Nao foi possivel gerar o certificado.", exception);
    }
  }
}
