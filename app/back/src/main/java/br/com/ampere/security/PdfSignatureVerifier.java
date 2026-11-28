package br.com.ampere.security;

import com.lowagie.text.pdf.AcroFields;
import com.lowagie.text.pdf.PdfArray;
import com.lowagie.text.pdf.PdfDictionary;
import com.lowagie.text.pdf.PdfName;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfString;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Collection;
import java.util.List;
import org.bouncycastle.asn1.ASN1InputStream;
import org.bouncycastle.asn1.cms.ContentInfo;
import org.bouncycastle.cert.X509CertificateHolder;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cms.CMSException;
import org.bouncycastle.cms.CMSProcessableByteArray;
import org.bouncycastle.cms.CMSSignedData;
import org.bouncycastle.cms.SignerInformation;
import org.bouncycastle.cms.jcajce.JcaSimpleSignerInfoVerifierBuilder;
import org.bouncycastle.operator.OperatorCreationException;
import org.springframework.stereotype.Component;

/** Checks the cryptographic signature of a PDF; who may sign is decided by the caller. */
@Component
public class PdfSignatureVerifier {

  public enum Outcome {
    /** No signature at all, as in the memorials issued before the signature. */
    ABSENT,
    /** Signed, but the bytes changed after it, or the signature does not cover the whole file. */
    INVALID,
    /** Intact, covering the whole file; the signer still needs to be checked. */
    INTACT
  }

  /** The signer certificate only when the outcome is INTACT. */
  public record Inspection(Outcome outcome, X509Certificate signer) {

    static Inspection of(Outcome outcome) {
      return new Inspection(outcome, null);
    }

    public String signerSha256() {
      return signer == null ? null : SigningCredentials.fingerprint(signer);
    }
  }

  public Inspection inspect(byte[] pdf) {
    List<String> names;
    AcroFields fields;
    try {
      fields = new PdfReader(pdf).getAcroFields();
      names = fields.getSignedFieldNames();
    } catch (IOException | RuntimeException unreadable) {
      return Inspection.of(Outcome.INVALID);
    }
    if (names.isEmpty()) {
      return Inspection.of(Outcome.ABSENT);
    }

    Inspection whole = Inspection.of(Outcome.INVALID);
    for (String name : names) {
      Inspection inspection = check(pdf, fields.getSignatureDictionary(name));
      if (inspection.outcome() != Outcome.INTACT) {
        return Inspection.of(Outcome.INVALID);
      }
      if (fields.signatureCoversWholeDocument(name)) {
        whole = inspection;
      }
    }

    return whole;
  }

  private static Inspection check(byte[] pdf, PdfDictionary signature) {
    try {
      PdfArray range = signature.getAsArray(PdfName.BYTERANGE);
      PdfString contents = signature.getAsString(PdfName.CONTENTS);
      if (range == null || contents == null || range.size() != 4) {
        return Inspection.of(Outcome.INVALID);
      }
      byte[] signed = signedBytes(pdf, range);
      if (signed == null) {
        return Inspection.of(Outcome.INVALID);
      }

      ContentInfo info;
      try (ASN1InputStream input = new ASN1InputStream(contents.getOriginalBytes())) {
        info = ContentInfo.getInstance(input.readObject());
      }
      CMSSignedData data = new CMSSignedData(new CMSProcessableByteArray(signed), info);
      Collection<SignerInformation> signers = data.getSignerInfos().getSigners();
      if (signers.size() != 1) {
        return Inspection.of(Outcome.INVALID);
      }
      SignerInformation signer = signers.iterator().next();
      @SuppressWarnings("unchecked")
      Collection<X509CertificateHolder> matches =
          data.getCertificates().getMatches(signer.getSID());
      if (matches.isEmpty()) {
        return Inspection.of(Outcome.INVALID);
      }
      X509CertificateHolder holder = matches.iterator().next();
      if (!signer.verify(new JcaSimpleSignerInfoVerifierBuilder().build(holder))) {
        return Inspection.of(Outcome.INVALID);
      }

      return new Inspection(
          Outcome.INTACT, new JcaX509CertificateConverter().getCertificate(holder));
    } catch (IOException
        | CMSException
        | OperatorCreationException
        | CertificateException
        | RuntimeException broken) {
      return Inspection.of(Outcome.INVALID);
    }
  }

  /** The two ranges around /Contents, or null when they do not frame it within the file. */
  private static byte[] signedBytes(byte[] pdf, PdfArray range) {
    long[] values = new long[4];
    for (int index = 0; index < 4; index++) {
      values[index] = range.getAsNumber(index).intValue();
    }
    long firstStart = values[0];
    long firstLength = values[1];
    long secondStart = values[2];
    long secondLength = values[3];
    if (firstStart != 0
        || firstLength < 0
        || secondLength < 0
        || secondStart < firstLength
        || secondStart + secondLength > pdf.length) {
      return null;
    }
    ByteArrayOutputStream signed = new ByteArrayOutputStream();
    signed.write(pdf, 0, (int) firstLength);
    signed.write(pdf, (int) secondStart, (int) secondLength);

    return signed.toByteArray();
  }
}
