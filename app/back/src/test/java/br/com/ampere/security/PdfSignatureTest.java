package br.com.ampere.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.ampere.security.PdfSignatureVerifier.Inspection;
import br.com.ampere.security.PdfSignatureVerifier.Outcome;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.AcroFields;
import com.lowagie.text.pdf.PdfName;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class PdfSignatureTest {

  private static final SigningCredentials AMPERE = SigningCredentials.selfSigned("CN=AMPERE");
  private static final SigningCredentials OTHER = SigningCredentials.selfSigned("CN=Outro");
  private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-11-28T10:00:00-03:00");

  private final PdfSignatureVerifier verifier = new PdfSignatureVerifier();

  @Test
  void aSignedPdfIsIntactAndNamesItsSigner() throws IOException {
    byte[] signed = PdfSigner.sign(pdf(), NOW, "Emissão", AMPERE);

    Inspection inspection = verifier.inspect(signed);
    assertThat(inspection.outcome()).isEqualTo(Outcome.INTACT);
    assertThat(inspection.signerSha256()).isEqualTo(AMPERE.certificateSha256());

    AcroFields fields = new PdfReader(signed).getAcroFields();
    String name = fields.getSignedFieldNames().getFirst();
    assertThat(fields.getSignatureDictionary(name).getAsName(PdfName.SUBFILTER))
        .isEqualTo(PdfSigner.SUB_FILTER);
    assertThat(fields.getSignatureDictionary(name).getAsString(PdfName.NAME).toUnicodeString())
        .isEqualTo("AMPERE");
  }

  @Test
  void aByteChangedAfterTheSignatureBreaksIt() {
    byte[] signed = PdfSigner.sign(pdf(), NOW, "Emissão", AMPERE);
    String text = new String(signed, StandardCharsets.ISO_8859_1);
    int title = text.indexOf("Memorial de teste");
    assertThat(title).isPositive();

    byte[] altered = signed.clone();
    altered[title] = 'X';

    assertThat(verifier.inspect(altered).outcome()).isEqualTo(Outcome.INVALID);
  }

  @Test
  void contentAppendedAfterTheSignatureIsNotCovered() {
    byte[] signed = PdfSigner.sign(pdf(), NOW, "Emissão", AMPERE);
    byte[] appended = Arrays.copyOf(signed, signed.length + 1);
    appended[signed.length] = '\n';

    assertThat(verifier.inspect(appended).outcome()).isEqualTo(Outcome.INVALID);
  }

  @Test
  void anotherCertificateSignsIntactButIsNotTheAmpereOne() {
    Inspection inspection = verifier.inspect(PdfSigner.sign(pdf(), NOW, "Emissão", OTHER));

    assertThat(inspection.outcome()).isEqualTo(Outcome.INTACT);
    assertThat(inspection.signerSha256())
        .isEqualTo(OTHER.certificateSha256())
        .isNotEqualTo(AMPERE.certificateSha256());
  }

  @Test
  void anUnsignedPdfHasNoSignature() {
    assertThat(verifier.inspect(pdf()).outcome()).isEqualTo(Outcome.ABSENT);
  }

  @Test
  void aBrokenFileWithoutSignatureHasNone() {
    assertThat(verifier.inspect("%PDF-1.7 quebrado".getBytes(StandardCharsets.US_ASCII)).outcome())
        .isEqualTo(Outcome.ABSENT);
  }

  @Test
  void aByteRangeWhoseGapIsNotTheSignatureIsInvalid() {
    byte[] forged =
        "%PDF-1.7\n/ByteRange [0 10 20 5] /Contents <00> padding....\n"
            .getBytes(StandardCharsets.US_ASCII);

    assertThat(verifier.inspect(forged).outcome()).isEqualTo(Outcome.INVALID);
  }

  @Test
  void aCompressionBombIsReadWithoutExpandingIt() {
    byte[] bomb = FlateBomb.pdf(256);
    assertThat(bomb.length).isLessThan(2 * 1024 * 1024);

    assertThat(verifier.inspect(bomb).outcome()).isEqualTo(Outcome.ABSENT);
  }

  @Test
  void aKeystoreInBase64LoadsTheSameCertificate() throws Exception {
    KeyStore store = KeyStore.getInstance("PKCS12");
    store.load(null, null);
    store.setKeyEntry(
        "ampere", AMPERE.key(), "senha".toCharArray(), AMPERE.chain().toArray(Certificate[]::new));
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    store.store(output, "senha".toCharArray());
    String base64 = Base64.getEncoder().encodeToString(output.toByteArray());

    SigningCredentials loaded =
        SigningCredentials.resolve(new SigningProperties(base64, "senha"), true);

    assertThat(loaded.certificateSha256()).isEqualTo(AMPERE.certificateSha256());
  }

  @Test
  void productionRefusesToStartWithoutTheKeystore() {
    assertThatThrownBy(() -> SigningCredentials.resolve(new SigningProperties("", ""), true))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("SIGNING_KEYSTORE");
    assertThat(SigningCredentials.resolve(new SigningProperties(null, null), false).certificate())
        .isNotNull();
  }

  private static byte[] pdf() {
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    Document document = new Document();
    PdfWriter.getInstance(document, output).setCompressionLevel(0);
    document.open();
    document.add(new Paragraph("Memorial de teste"));
    document.close();

    return output.toByteArray();
  }
}
