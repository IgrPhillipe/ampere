package br.com.ampere.security;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.zip.Deflater;
import java.util.zip.DeflaterOutputStream;

/** A small PDF whose object stream inflates to the given size, as a hostile upload would. */
public final class FlateBomb {

  private FlateBomb() {}

  public static byte[] pdf(int inflatedMegabytes) {
    ByteArrayOutputStream compressed = new ByteArrayOutputStream();
    try (DeflaterOutputStream deflater =
        new DeflaterOutputStream(compressed, new Deflater(Deflater.BEST_COMPRESSION))) {
      deflater.write(ascii("4 0 <<>>"));
      byte[] spaces = new byte[1 << 20];
      Arrays.fill(spaces, (byte) ' ');
      for (int megabyte = 0; megabyte < inflatedMegabytes; megabyte++) {
        deflater.write(spaces);
      }
    } catch (IOException impossible) {
      throw new IllegalStateException(impossible);
    }
    byte[] stream = compressed.toByteArray();

    ByteArrayOutputStream pdf = new ByteArrayOutputStream();
    pdf.writeBytes(ascii("%PDF-1.5\n"));
    pdf.writeBytes(ascii("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"));
    pdf.writeBytes(ascii("2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\n"));
    pdf.writeBytes(
        ascii(
            "3 0 obj\n<< /Type /ObjStm /N 1 /First 4 /Filter /FlateDecode /Length "
                + stream.length
                + " >>\nstream\n"));
    pdf.writeBytes(stream);
    pdf.writeBytes(ascii("\nendstream\nendobj\ntrailer\n<< /Root 1 0 R /Size 5 >>\n%%EOF\n"));

    return pdf.toByteArray();
  }

  private static byte[] ascii(String text) {
    return text.getBytes(StandardCharsets.US_ASCII);
  }
}
