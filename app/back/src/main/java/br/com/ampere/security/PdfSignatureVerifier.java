package br.com.ampere.security;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HexFormat;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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

/** Reads the signature from the raw bytes, never inflating a stream; the caller decides trust. */
@Component
public class PdfSignatureVerifier {

  private static final Pattern BYTE_RANGE =
      Pattern.compile(
          "/ByteRange\\s*\\[\\s*(\\d{1,10})\\s+(\\d{1,10})\\s+(\\d{1,10})\\s+(\\d{1,10})\\s*\\]");

  private static final Pattern HEX_STRING = Pattern.compile("<([0-9A-Fa-f\\s]*)>");

  public enum Outcome {
    /** No signature dictionary in the file, as in the memorials issued before the signature. */
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

  private record Range(int firstLength, int secondStart, int secondLength) {}

  public Inspection inspect(byte[] pdf) {
    // ISO-8859-1 maps each byte to one char, so string offsets are file offsets.
    String text = new String(pdf, StandardCharsets.ISO_8859_1);
    List<Range> ranges = new ArrayList<>();
    Matcher matcher = BYTE_RANGE.matcher(text);
    while (matcher.find()) {
      Range range = range(matcher, pdf.length);
      if (range == null) {
        return Inspection.of(Outcome.INVALID);
      }
      ranges.add(range);
    }
    if (ranges.isEmpty()) {
      return Inspection.of(Outcome.ABSENT);
    }

    Inspection whole = Inspection.of(Outcome.INVALID);
    for (Range range : ranges) {
      Inspection inspection = check(pdf, text, range);
      if (inspection.outcome() != Outcome.INTACT) {
        return Inspection.of(Outcome.INVALID);
      }
      if (range.secondStart() + range.secondLength() == pdf.length) {
        whole = inspection;
      }
    }

    return whole;
  }

  /** The two ranges around /Contents, or null when they do not frame a gap within the file. */
  private static Range range(Matcher matcher, int fileLength) {
    long firstStart = Long.parseLong(matcher.group(1));
    long firstLength = Long.parseLong(matcher.group(2));
    long secondStart = Long.parseLong(matcher.group(3));
    long secondLength = Long.parseLong(matcher.group(4));
    if (firstStart != 0 || secondStart <= firstLength || secondStart + secondLength > fileLength) {
      return null;
    }

    return new Range((int) firstLength, (int) secondStart, (int) secondLength);
  }

  private static Inspection check(byte[] pdf, String text, Range range) {
    // The gap must be exactly the /Contents hex string, so nothing unsigned hides in it.
    Matcher contents = HEX_STRING.matcher(text.substring(range.firstLength(), range.secondStart()));
    if (!contents.matches()) {
      return Inspection.of(Outcome.INVALID);
    }
    try {
      byte[] cms = HexFormat.of().parseHex(contents.group(1).replaceAll("\\s", ""));
      ByteArrayOutputStream signed = new ByteArrayOutputStream();
      signed.write(pdf, 0, range.firstLength());
      signed.write(pdf, range.secondStart(), range.secondLength());

      ContentInfo info;
      try (ASN1InputStream input = new ASN1InputStream(cms)) {
        info = ContentInfo.getInstance(input.readObject());
      }
      CMSSignedData data =
          new CMSSignedData(new CMSProcessableByteArray(signed.toByteArray()), info);
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
}
