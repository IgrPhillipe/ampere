package br.com.ampere.security;

import com.lowagie.text.DocumentException;
import com.lowagie.text.pdf.PdfDate;
import com.lowagie.text.pdf.PdfDictionary;
import com.lowagie.text.pdf.PdfName;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfSignature;
import com.lowagie.text.pdf.PdfSignatureAppearance;
import com.lowagie.text.pdf.PdfStamper;
import com.lowagie.text.pdf.PdfString;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;
import org.bouncycastle.asn1.ASN1EncodableVector;
import org.bouncycastle.asn1.DERSet;
import org.bouncycastle.asn1.cms.Attribute;
import org.bouncycastle.asn1.cms.AttributeTable;
import org.bouncycastle.asn1.cms.CMSAttributes;
import org.bouncycastle.asn1.ess.ESSCertIDv2;
import org.bouncycastle.asn1.ess.SigningCertificateV2;
import org.bouncycastle.asn1.pkcs.PKCSObjectIdentifiers;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x500.style.BCStyle;
import org.bouncycastle.asn1.x500.style.IETFUtils;
import org.bouncycastle.asn1.x509.GeneralName;
import org.bouncycastle.asn1.x509.GeneralNames;
import org.bouncycastle.asn1.x509.IssuerSerial;
import org.bouncycastle.cert.jcajce.JcaCertStore;
import org.bouncycastle.cms.CMSAttributeTableGenerator;
import org.bouncycastle.cms.CMSException;
import org.bouncycastle.cms.CMSProcessableByteArray;
import org.bouncycastle.cms.CMSSignedDataGenerator;
import org.bouncycastle.cms.DefaultSignedAttributeTableGenerator;
import org.bouncycastle.cms.jcajce.JcaSignerInfoGeneratorBuilder;
import org.bouncycastle.operator.OperatorCreationException;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.bouncycastle.operator.jcajce.JcaDigestCalculatorProviderBuilder;
import org.springframework.stereotype.Component;

/** PAdES baseline B signature (ETSI.CAdES.detached) with the AMPERE certificate. */
@Component
public class PdfSigner {

  public static final PdfName SUB_FILTER = new PdfName("ETSI.CAdES.detached");

  /** Room for the CMS in /Contents: the chain plus one RSA or ECDSA signature. */
  private static final int RESERVED_BYTES = 16 * 1024;

  private final SigningCredentials credentials;

  public PdfSigner(SigningCredentials credentials) {
    this.credentials = credentials;
  }

  public String certificateSha256() {
    return credentials.certificateSha256();
  }

  public byte[] sign(byte[] pdf, OffsetDateTime signedAt, String reason) {
    return sign(pdf, signedAt, reason, credentials);
  }

  public static byte[] sign(
      byte[] pdf, OffsetDateTime signedAt, String reason, SigningCredentials credentials) {
    try {
      PdfReader reader = new PdfReader(pdf);
      ByteArrayOutputStream output = new ByteArrayOutputStream();
      PdfStamper stamper = PdfStamper.createSignature(reader, output, '\0');
      Calendar when = GregorianCalendar.from(signedAt.toZonedDateTime());

      PdfSignatureAppearance appearance = stamper.getSignatureAppearance();
      appearance.setCrypto(null, credentials.chain().toArray(X509Certificate[]::new), null, null);
      appearance.setSignDate(when);
      appearance.setReason(reason);
      appearance.setLocation("AMPERE");

      PdfSignature dictionary = new PdfSignature(PdfName.ADOBE_PPKLITE, SUB_FILTER);
      dictionary.setName(commonName(credentials.certificate()));
      dictionary.setReason(reason);
      dictionary.setLocation("AMPERE");
      dictionary.setDate(new PdfDate(when));
      appearance.setCryptoDictionary(dictionary);

      Map<PdfName, Integer> exclusions = new HashMap<>();
      exclusions.put(PdfName.CONTENTS, RESERVED_BYTES * 2 + 2);
      appearance.preClose(exclusions);

      byte[] cms = cms(appearance.getRangeStream().readAllBytes(), credentials);
      if (cms.length > RESERVED_BYTES) {
        throw new IllegalStateException("Assinatura maior que o espaco reservado no PDF.");
      }
      PdfDictionary contents = new PdfDictionary();
      contents.put(
          PdfName.CONTENTS, new PdfString(Arrays.copyOf(cms, RESERVED_BYTES)).setHexWriting(true));
      appearance.close(contents);

      return output.toByteArray();
    } catch (IOException | DocumentException exception) {
      throw new IllegalStateException("Nao foi possivel assinar o PDF.", exception);
    }
  }

  private static byte[] cms(byte[] signedContent, SigningCredentials credentials) {
    X509Certificate certificate = credentials.certificate();
    PrivateKey key = credentials.key();
    try {
      ESSCertIDv2 certId =
          new ESSCertIDv2(
              SigningCredentials.digest(certificate.getEncoded()),
              new IssuerSerial(
                  new GeneralNames(
                      new GeneralName(
                          X500Name.getInstance(certificate.getIssuerX500Principal().getEncoded()))),
                  certificate.getSerialNumber()));
      ASN1EncodableVector attributes = new ASN1EncodableVector();
      attributes.add(
          new Attribute(
              PKCSObjectIdentifiers.id_aa_signingCertificateV2,
              new DERSet(new SigningCertificateV2(new ESSCertIDv2[] {certId}))));
      DefaultSignedAttributeTableGenerator standard =
          new DefaultSignedAttributeTableGenerator(new AttributeTable(attributes));
      // PAdES takes the signing time from /M; the CMS attribute must be absent.
      CMSAttributeTableGenerator withoutSigningTime =
          parameters -> standard.getAttributes(parameters).remove(CMSAttributes.signingTime);

      CMSSignedDataGenerator generator = new CMSSignedDataGenerator();
      generator.addSignerInfoGenerator(
          new JcaSignerInfoGeneratorBuilder(new JcaDigestCalculatorProviderBuilder().build())
              .setSignedAttributeGenerator(withoutSigningTime)
              .build(new JcaContentSignerBuilder(algorithm(key)).build(key), certificate));
      generator.addCertificates(new JcaCertStore(credentials.chain()));

      return generator.generate(new CMSProcessableByteArray(signedContent), false).getEncoded();
    } catch (GeneralSecurityException
        | OperatorCreationException
        | CMSException
        | IOException exception) {
      throw new IllegalStateException("Nao foi possivel assinar o PDF.", exception);
    }
  }

  private static String algorithm(PrivateKey key) {
    return switch (key.getAlgorithm()) {
      case "EC" -> "SHA256withECDSA";
      default -> "SHA256withRSA";
    };
  }

  static String commonName(X509Certificate certificate) {
    X500Name subject = X500Name.getInstance(certificate.getSubjectX500Principal().getEncoded());
    var names = subject.getRDNs(BCStyle.CN);

    return names.length == 0
        ? subject.toString()
        : IETFUtils.valueToString(names[0].getFirst().getValue());
  }
}
